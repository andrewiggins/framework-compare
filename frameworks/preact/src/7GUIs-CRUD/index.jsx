import { render, Component } from "preact";
import { createApi } from "../../../../lib/crud";
import { NameInput } from "./NameInput";
import { FilterInput } from "./FilterInput";
import { EMPTY_PERSON, getDisplayName } from "./util";
import { PersonSelect } from "./PersonSelect";

const { listAll, create, read, update, remove } = createApi();

function Loading() {
	return <div>Loading...</div>;
}

/**
 * @typedef {import('lib/crud').Person} Person
 * @typedef { "initial" | "create" | "update" | "delete" | null } LoadingState;
 * @typedef {{ filter: string; name: string; surname: string; selectedPersonId: number; persons: Person[]; loading: LoadingState; }} State
 * @returns {State}
 */
function getInitialState() {
	return {
		filter: "",
		name: "",
		surname: "",
		selectedPersonId: null,
		persons: [],
		loading: "initial"
	};
}

class App extends Component {
	constructor(props, context) {
		super(props, context);

		/** @type {State} */
		this.state = getInitialState();

		this.onNameInput = this.onNameInput.bind(this);
		this.onSurnameInput = this.onSurnameInput.bind(this);
		this.onFilterInput = this.onFilterInput.bind(this);
		this.onPersonSelect = this.onPersonSelect.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
	}

	componentDidMount() {
		// TODO: Cancel request if unmounted
		// TODO: handle rejections
		listAll().then(persons => {
			const person = persons.length ? persons[0] : EMPTY_PERSON;
			this.setState({
				persons,
				name: person.name,
				surname: person.surname,
				selectedPersonId: person.id,
				loading: null
			});
		});
	}

	onNameInput(e) {
		this.setState({ name: e.target.value });
	}

	onSurnameInput(e) {
		this.setState({ surname: e.target.value });
	}

	onFilterInput(e) {
		this.setState({ filter: e.target.value });
	}

	onPersonSelect(e) {
		const selectedId = e.target.value;
		const selectedPerson =
			this.state.persons.filter(person => person.id == selectedId)[0] ||
			EMPTY_PERSON;
		this.setState({
			name: selectedPerson.name,
			surname: selectedPerson.surname,
			selectedPersonId: selectedPerson.id
		});
	}

	onCreate() {
		const { name, surname } = this.state;

		this.setState({ loading: "create" });
		// TODO: cancel this request if the component is unmounted
		// TODO: handle rejections
		create(name, surname).then(person => {
			this.setState({
				// TODO: Which inputs do we disable? If not all, then we need to handle
				// one of the inputs changing while the request happens
				selectedPersonId: person.id,
				persons: this.state.persons.concat(person),
				loading: null
			});
		});
	}

	onUpdate() {
		const { selectedPersonId, name, surname } = this.state;

		this.setState({ loading: "update" });
		// TODO: cancel this request if the component is unmounted
		// TODO: handle rejections
		update(selectedPersonId, name, surname).then(person => {
			const persons = this.state.persons.map(p => {
				return p.id == person.id ? person : p;
			});

			this.setState({
				// TODO: Which inputs do we disable? If not all, then we need to handle
				// one of the inputs changing while the request happens
				selectedPersonId: person.id,
				persons,
				loading: null
			});
		});
	}

	onDelete() {
		const { selectedPersonId, name, surname } = this.state;

		this.setState({ loading: "delete" });
		// TODO: cancel this request if the component is unmounted
		// TODO: handle rejections
		remove(selectedPersonId).then(deletedPerson => {
			/** @type {number} */
			let oldIndex;
			const persons = this.state.persons.filter((p, i) => {
				if (p.id == deletedPerson.id) {
					oldIndex = i;
					return false;
				} else {
					return true;
				}
			});

			const newSelectedPerson =
				oldIndex < persons.length ? persons[oldIndex] : persons[oldIndex - 1];

			this.setState({
				// TODO: Which inputs do we disable? If not all, then we need to handle
				// one of the inputs changing while the request happens
				selectedPersonId: newSelectedPerson.id,
				name: newSelectedPerson.name,
				surname: newSelectedPerson.surname,
				persons,
				loading: null
			});
		});
	}

	/**
	 * @param {{}} props
	 * @param {State} state
	 */
	render(props, state) {
		if (state.loading == "initial") {
			return <Loading />;
		}

		let selectedPerson = EMPTY_PERSON;
		let isUpdated = false;
		if (state.selectedPersonId != null) {
			selectedPerson = state.persons.find(p => p.id == state.selectedPersonId);
			isUpdated =
				state.name != selectedPerson.name ||
				state.surname != selectedPerson.surname;
		}

		// TODO: Consider if filteredPersons should be state so that the
		// value of the options can be the index in the filteredPersons array
		// and the selectedPerson is just the index in the filteredPersons array
		let filteredPersons = state.persons;
		if (state.filter) {
			filteredPersons = state.persons.filter(person => {
				return getDisplayName(person)
					.toLowerCase()
					.startsWith(state.filter.toLowerCase());
			});
		}

		return (
			<fieldset class="crud-wrapper" disabled={state.loading != null}>
				<legend>People manager</legend>
				<FilterInput value={state.filter} onInput={this.onFilterInput} />
				<PersonSelect
					persons={filteredPersons}
					selectedId={state.selectedPersonId}
					onChange={this.onPersonSelect}
				/>
				<NameInput
					id="name"
					value={state.name}
					onInput={this.onNameInput}
					label="Name:"
					required
				/>
				<NameInput
					id="surname"
					value={state.surname}
					onInput={this.onSurnameInput}
					label="Surname:"
				/>
				<div class="form-group btn-group btn-group-block">
					<button
						type="button"
						class="btn"
						onClick={this.onCreate}
						disabled={state.name == ""}
					>
						Create
					</button>
					<button
						type="button"
						class="btn"
						onClick={this.onUpdate}
						disabled={state.name == "" || !isUpdated}
					>
						Update
					</button>
					<button
						type="button"
						class="btn"
						onClick={this.onDelete}
						disabled={state.selectedPersonId == null}
					>
						Delete
					</button>
				</div>
				{/* TODO: Add loading state display */}
				{/* <div class="loading loading-lg"></div> */}
			</fieldset>
		);
	}
}

render(<App />, document.getElementById("app"));

// Tests:
// - list all works (loading is shown, list is shown)
// - list all rejects
// - filter includes selection (list is updated, still selected, inputs show right value)
// - filter removes selection (list is updated, select next valid item, inputs shows new selection)
// - inputs show validation error if name input is empty (create & updated are disabled, error message under name is shown)
// - create works (form disabled, form re-enabled, added to list, selected in list, inputs show name)
// - create rejects
// - update works (form disabled, form re-enabled, updated name in list, selected in list, input shows updated name)
// - update is disabled if names are the same
// - update rejects
// - delete works (form disabled, form re-enabled, removed from list, next item selected, input shows new selection)
// - delete rejects
// - All deletes: should update the text fields
// - All deletes: verify filter + delete work (next selected person shouldn't be filtered)
// - Delete all people from top
// - Delete all people from bottom
// - Delete first person (n)
// - Delete middle person (5?)
// - Delete second to last person (4 total)
// - Delete last person (n)
