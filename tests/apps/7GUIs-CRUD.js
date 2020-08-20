import {
	getAppHtml,
	toHtmlString,
	formatHtml,
	appSel,
	backspaceInput
} from "../util";

/**
 * @typedef {import('../../scripts/bundles/controls/mockFetch').Config} Config
 * @typedef {import('../../scripts/bundles/controls/mockFetch').Request} Request
 */

function getInitialLoadingMarkup() {
	return formatHtml(<div>Loading...</div>);
}

function getInitialPageMarkup() {
	return formatHtml(
		<fieldset class="crud-wrapper">
			<legend>People manager</legend>
			<div class="form-group">
				<label class="form-label">Filter prefix: </label>
				<input id="filter-input" type="text" class="form-input" />
			</div>
			<div class="form-group">
				<label class="form-label">Select a person to edit:</label>
				<select id="people-select" size="5" class="form-select">
					<option>Emil, Hans</option>
					<option>Mustermann, Max</option>
					<option>Tisch, Roman</option>
				</select>
			</div>
			<div class="form-group">
				<label for="name" class="form-label">
					Name:{" "}
				</label>
				<input id="name" class="form-input" type="text" required="" />
			</div>
			<div class="form-group">
				<label for="surname" class="form-label">
					Surname:{" "}
				</label>
				<input id="surname" class="form-input" type="text" />
			</div>
			<div class="form-group btn-group btn-group-block">
				<button id="create" type="button" class="btn">
					Create
				</button>
				<button id="update" type="button" class="btn" disabled="">
					Update
				</button>
				<button id="delete" type="button" class="btn">
					Delete
				</button>
			</div>
		</fieldset>
	);
}

async function debugConfig() {
	console.log(
		await page.evaluate(() => {
			/** @type {Config} */
			const config = window.mockFetchConfig;
			return {
				...config,
				requests: Object.fromEntries(config.requests.entries())
			};
		})
	);
}

async function resumeRequest(name) {
	await page.evaluate(name => {
		/** @type {Config} */
		const config = window.mockFetchConfig;
		const requests = Array.from(config.requests.values());
		const request = requests.find(r => r.name == name);
		if (!request) {
			throw new Error(`Could not find request with name "${name}"`);
		}

		config.resume(request.id);
	}, name);
}

const fieldsetSel = appSel("fieldset.crud-wrapper");
const filterSel = appSel("#filter-input");
const peopleSel = appSel("#people-select");
const peopleOptionsSel = appSel("#people-select option");
const nthOptionSel = n => appSel(`#people-select option:nth-child(${n})`);
const nameSel = appSel("#name");
const surnameSel = appSel("#surname");
const createSel = appSel("#create");
const updateSel = appSel("#update");
const deleteSel = appSel("#delete");

/**
 * @typedef {{ value: string; text: string; selected: boolean; }} OptionData
 * @typedef {{ disabled: boolean; }} ButtonState
 * @typedef UIState
 * @property {boolean} disabled
 * @property {string} filter
 * @property {OptionData[]} options
 * @property {string} name
 * @property {string} surname
 * @property {ButtonState} create
 * @property {ButtonState} update
 * @property {ButtonState} delete
 * @returns {UIState}
 */
function getInitialUIState() {
	return {
		disabled: false,
		filter: "",
		options: [
			{ value: "0", text: "Emil, Hans", selected: true },
			{ value: "1", text: "Mustermann, Max", selected: false },
			{ value: "2", text: "Tisch, Roman", selected: false }
		],
		name: "Hans",
		surname: "Emil",
		create: {
			disabled: false
		},
		update: {
			disabled: true
		},
		delete: {
			disabled: false
		}
	};
}

/**
 * @param {string} selector
 * @returns {Promise<ButtonState>}
 */
function readButtonState(selector) {
	return page.$eval(selector, btn => ({
		disabled: btn.disabled
	}));
}

/**
 * @returns {Promise<UIState>}
 */
async function readUIState() {
	return {
		disabled: await page.$eval(fieldsetSel, el => el.disabled),
		filter: await page.$eval(filterSel, el => el.value),
		options: await page.$$eval(peopleOptionsSel, els =>
			els.map(el => ({
				value: el.value,
				text: el.textContent,
				selected: el.selected
			}))
		),
		name: await page.$eval(nameSel, el => el.value),
		surname: await page.$eval(surnameSel, el => el.value),
		create: await readButtonState(createSel),
		update: await readButtonState(updateSel),
		delete: await readButtonState(deleteSel)
	};
}

/**
 * @param {Partial<UIState>} [expectedState]
 */
async function verifyUIState(expectedState = {}) {
	const actualUIState = await readUIState();
	expect(actualUIState).toEqual({
		...getInitialUIState(),
		...expectedState
	});
}

async function addPerson(currentUIState, name, surname) {
	await backspaceInput(nameSel);
	await backspaceInput(surnameSel);
	await page.type(nameSel, name);
	await page.type(surnameSel, surname);
	await page.click(createSel);
	await resumeRequest("PUT /persons");
	await page.click(nthOptionSel(1));

	const newUiState = {
		...currentUIState,
		options: [
			...currentUIState.options,
			{
				value: `${currentUIState.options.length}`,
				text: `${surname}, ${name}`,
				selected: false
			}
		]
	};

	await verifyUIState(newUiState);
	return newUiState;
}

/**
 * @param {string} frameworkName
 * @param {(options?: import('puppeteer').DirectNavigationOptions) => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe("7GUIs CRUD", () => {
		beforeEach(async () => {
			await appSetup({ waitUntil: "load" });
		});

		it("renders the correct initial HTML", async () => {
			// list all works (loading is shown, list is shown)
			await expect(getAppHtml()).resolves.toEqual(getInitialLoadingMarkup());
			await resumeRequest("GET /persons");
			await expect(getAppHtml()).resolves.toEqual(getInitialPageMarkup());
		});

		// TODO: list all rejects

		it("properly filters the list when filter includes selection", async () => {
			// filter includes selection (list is updated, still selected, inputs show
			// right value)
			await resumeRequest("GET /persons");
			await verifyUIState();

			await page.type(filterSel, "E");

			const initialOptions = getInitialUIState().options;
			await verifyUIState({
				filter: "E",
				options: [initialOptions[0]]
			});
		});

		// TODO: filter removes selection (list is updated, select next valid item,
		// inputs shows new selection)

		// TODO: inputs show validation error if name input is empty (create &
		// updated are disabled, error message under name is shown)

		it("create flow disables then re-enables form and selects new person", async () => {
			// create works (form disabled, form re-enabled, added to list, selected
			// in list, inputs show name)
			await resumeRequest("GET /persons");
			await verifyUIState();

			await backspaceInput(nameSel);
			await backspaceInput(surnameSel);
			await page.type(nameSel, "Bob");
			await page.type(surnameSel, "Ross");
			await page.click(createSel);

			await verifyUIState({
				disabled: true,
				name: "Bob",
				surname: "Ross",
				update: { disabled: false }
			});

			await resumeRequest("PUT /persons");

			const initialOptions = getInitialUIState().options;
			initialOptions[0].selected = false;
			await verifyUIState({
				disabled: false,
				options: [
					...initialOptions,
					{ value: "3", text: "Ross, Bob", selected: true }
				],
				name: "Bob",
				surname: "Ross"
			});
		});

		// TODO: create rejects

		it("update flow disables the re-enables the form and update button, keeping the updated person selected", async () => {
			// update works (form disabled, form re-enabled, updated name in list,
			// selected in list, input shows updated name)
			// update button is disabled if name inputs match selected option

			const uiState = getInitialUIState();
			await resumeRequest("GET /persons");
			await verifyUIState(uiState);

			await page.click(nthOptionSel(3));

			uiState.options[0].selected = false;
			uiState.options[2].selected = true;
			uiState.name = "Roman";
			uiState.surname = "Tisch";
			await verifyUIState(uiState);

			await page.type(nameSel, "nn");
			await page.type(surnameSel, "hh");
			await page.click(updateSel);

			uiState.disabled = true;
			uiState.name += "nn";
			uiState.surname += "hh";
			uiState.update.disabled = false;
			await verifyUIState(uiState);

			await resumeRequest("POST /persons/2");

			uiState.disabled = false;
			uiState.options[2].text = "Tischhh, Romannn";
			uiState.update.disabled = true;
			await verifyUIState(uiState);
		});

		// TODO: update rejects

		it("delete flow disables and re-enables form, removing the selected item from the list and selecting the next item", async () => {
			// delete works (form disabled, form re-enabled, removed from list, next
			// item selected, input shows new selection)
			const uiState = getInitialUIState();
			await resumeRequest("GET /persons");
			await verifyUIState(uiState);

			await page.click(deleteSel);

			uiState.disabled = true;
			await verifyUIState(uiState);

			await resumeRequest("DELETE /persons/0");

			uiState.disabled = false;
			uiState.options = uiState.options.slice(1);
			uiState.options[0].selected = true;
			uiState.name = "Max";
			uiState.surname = "Mustermann";
			await verifyUIState(uiState);
		});

		// TODO: Fix
		it.skip("delete flow properly selects next item when filtered", async () => {
			// Should select next item in filtered list, not the next item in the
			// un-filtered list
			let uiState = getInitialUIState();
			await resumeRequest("GET /persons");
			await verifyUIState(uiState);

			uiState = await addPerson(uiState, "Bob", "Moss");

			await page.type(filterSel, "M");
			await page.click(nthOptionSel(1));

			const originalOptions = uiState.options;
			uiState.name = "Max";
			uiState.surname = "Mustermann";
			uiState.filter = "M";
			uiState.options = [uiState.options[1], uiState.options[3]];
			uiState.options[0].selected = true;
			await verifyUIState(uiState);

			await page.click(deleteSel);
			await resumeRequest("DELETE /persons/1");

			uiState.name = "Bob";
			uiState.surname = "Moss";
			uiState.options = [uiState.options[1]];
			uiState.options[0].selected = true;
			await verifyUIState(uiState);
		});

		// TODO: delete rejects

		// More Test TODO:
		// - All deletes: should update the text fields
		// - All deletes: verify filter + delete work (next selected person shouldn't be filtered)
		// - Delete all people from top
		// - Delete all people from bottom
		// - Delete first person (n)
		// - Delete middle person (5?)
		// - Delete second to last person (4 total)
		// - Delete last person (n)
	});
}
