import { getAppHtml, toHtmlString, formatHtml } from "../util";

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
				<input type="text" class="form-input" />
			</div>
			<div class="form-group">
				<label class="form-label">Select a person to edit:</label>
				<select size="5" class="form-select">
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
				<button type="button" class="btn">
					Create
				</button>
				<button type="button" class="btn" disabled="">
					Update
				</button>
				<button type="button" class="btn">
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

/**
 * @param {string} frameworkName
 * @param {(options?: import('puppeteer').DirectNavigationOptions) => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe.only("7GUIs CRUD", () => {
		beforeEach(async () => {
			await appSetup({ waitUntil: "load" });
		});

		it("renders the correct initial HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual(getInitialLoadingMarkup());
			await resumeRequest("GET /persons");
			await expect(getAppHtml()).resolves.toEqual(getInitialPageMarkup());
		});
	});
}
