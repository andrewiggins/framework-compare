let id = 3;

/** @type {(url: string, options?: RequestInit) => Promise<any>} */
const mockFetch = window.mockFetch;

/**
 * @typedef {{ id: number; name: string; surname: string; }} Person
 * @param {Person} person
 * @returns {Person}
 */
function copyPerson(person) {
	return {
		id: person.id,
		name: person.name,
		surname: person.surname
	};
}

export function getInitialState() {
	return [
		{ id: 0, name: "Hans", surname: "Emil" },
		{ id: 1, name: "Max", surname: "Mustermann" },
		{ id: 2, name: "Roman", surname: "Tisch" }
	];
}

export function createApi() {
	/**
	 * @type {Person[]}}
	 */
	const store = getInitialState();

	function getPersonById(id) {
		for (let person of store) {
			if (person.id == id) {
				return person;
			}
		}

		return null;
	}

	return {
		/**
		 * @param {string} name
		 * @param {string} surname
		 * @returns {Promise<Person>}
		 */
		create(name, surname) {
			/** @type {Person} */
			const person = {
				id: id++,
				name,
				surname
			};

			return mockFetch("/persons", {
				method: "PUT",
				body: JSON.stringify(person)
			}).then(() => {
				store.push(person);
				return copyPerson(person);
			});
		},

		/**
		 * @returns {Promise<Person[]>}
		 */
		listAll() {
			return mockFetch("/persons").then(() => store.map(copyPerson));
		},

		/**
		 * @param {number} id
		 * @returns {Promise<Person>}
		 */
		read(id) {
			return mockFetch(`/persons/${id}`).then(() =>
				copyPerson(getPersonById(id))
			);
		},

		/**
		 * @param {number} id
		 * @param {string} name
		 * @param {string} surname
		 * @returns {Promise<Person>}
		 */
		update(id, name, surname) {
			const body = JSON.stringify({ name, surname });
			return mockFetch(`/persons/${id}`, { method: "POST", body }).then(() => {
				const person = getPersonById(id);
				if (person == null) {
					throw new Error(`Could not find person with id "${id}".`);
				}

				person.name = name;
				person.surname = surname;
				return copyPerson(person);
			});
		},

		/**
		 * @param {number} id
		 * @returns {Promise<Person>}
		 */
		remove(id) {
			return mockFetch(`/persons/${id}`, { method: "DELETE" }).then(() => {
				const person = getPersonById(id);
				if (person == null) {
					throw new Error(`Could not find person with id "${id}".`);
				}

				store.splice(store.indexOf(person), 1);
				return copyPerson(person);
			});
		}
	};
}
