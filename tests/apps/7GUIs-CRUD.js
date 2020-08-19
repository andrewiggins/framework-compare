import { getAppHtml, toHtmlString, minifyHtml } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	function getMarkup() {
		return minifyHtml(
			<fieldset class="crud-wrapper">
				<legend>People manager</legend>
				<div class="form-group">
					<label class="form-label">Filter prefix: </label>
					<input type="text" class="form-input" />
				</div>
				<div class="form-group">
					<label class="form-label">Select a person to edit:</label>
					<select size="5" class="form-select">
						<option value="0">Emil, Hans</option>
						<option value="1">Mustermann, Max</option>
						<option value="2">Tisch, Roman</option>
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

	describe("7GUIs CRUD", () => {
		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			// TODO: Should render loading, then app html
			await expect(getAppHtml()).resolves.toEqual(getMarkup());
		});
	});
}
