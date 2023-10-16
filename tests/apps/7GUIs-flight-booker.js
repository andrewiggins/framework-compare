import {
	getAppHtml,
	toHtmlString,
	appSel,
	backspaceInput,
	minifyHtml
} from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe("7GUIs Flight Booker", () => {
		const tripTypeSel = appSel("select#trip-type");
		const departingSel = appSel("input#Departing-date");
		const returningSel = appSel("input#Returning-date");
		const bookSel = appSel("button");
		const departingErrorSel = appSel(
			".form-group.has-error #Departing-date+.form-input-hint"
		);
		const returningErrorSel = appSel(
			".form-group.has-error #Returning-date+.form-input-hint"
		);

		const oneWayType = "one-way";
		const returnType = "return";

		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			const expectedHtml = minifyHtml(
				<>
					<div class="form-group">
						<label class="form-label" for="trip-type">
							Trip type
						</label>
						<select id="trip-type" class="form-select">
							<option>one-way flight</option>
							<option>return flight</option>
						</select>
					</div>
					<div class="form-group">
						<label class="form-label" for="Departing-date">
							Departing
						</label>
						<input id="Departing-date" class="form-input" type="text" />
					</div>
					<div class="form-group">
						<label class="form-label" for="Returning-date">
							Returning
						</label>
						<input
							id="Returning-date"
							class="form-input"
							type="text"
							disabled=""
						/>
					</div>
					<div class="form-group">
						<button class="btn btn-primary">book</button>
					</div>
				</>
			);
			await expect(getAppHtml()).resolves.toEqual(expectedHtml);
		});

		it("initializes with one-way flight selected", async () => {
			// Default trip type is one-way
			const tripType = await page.$eval(tripTypeSel, el => el.value);
			expect(tripType).toEqual(oneWayType);

			// departing is enabled and non-empty
			const [departingValue, isDepartingDisabled] = await page.$eval(
				departingSel,
				el => [el.value, el.disabled]
			);
			expect(departingValue).not.toEqual("");
			expect(isDepartingDisabled).toEqual(false);

			// returning is disabled and non-empty (same as departing)
			const [returningValue, isReturningDisabled] = await page.$eval(
				returningSel,
				el => [el.value, el.disabled]
			);
			expect(returningValue).toEqual(departingValue);
			expect(isReturningDisabled).toEqual(true);

			// book button is enabled
			const isBookDisabled = await page.$eval(bookSel, el => el.disabled);
			expect(isBookDisabled).toEqual(false);
		});

		it("toggles disabled on returning input box based on trip type", async () => {
			await page.select(tripTypeSel, oneWayType);
			let isReturnDisabled = await page.$eval(returningSel, el => el.disabled);
			expect(isReturnDisabled).toEqual(true);

			await page.select(tripTypeSel, returnType);
			isReturnDisabled = await page.$eval(returningSel, el => el.disabled);
			expect(isReturnDisabled).toEqual(false);

			await page.select(tripTypeSel, oneWayType);
			isReturnDisabled = await page.$eval(returningSel, el => el.disabled);
			expect(isReturnDisabled).toEqual(true);
		});

		it("displays an error and disables the book button if the return flight input is strictly before the departing flight", async () => {
			await page.select(tripTypeSel, returnType);
			const isReturnDisabled = await page.$eval(
				returningSel,
				el => el.disabled
			);
			expect(isReturnDisabled).toEqual(false);

			await backspaceInput(returningSel);
			await page.type(returningSel, "2018-07-10");
			const returnDate = await page.$eval(returningSel, el => el.value);
			const isBookDisabled = await page.$eval(bookSel, el => el.disabled);
			const errorMessage = await page.$eval(
				returningErrorSel,
				el => el.textContent
			);

			expect(returnDate).toEqual("2018-07-10");
			expect(isBookDisabled).toEqual(true);
			expect(errorMessage).toMatch(/after departing date/);
		});

		it("displays an error message and disables book button if the departing date is invalid", async () => {
			let errorContainer = await page.$(departingErrorSel);
			expect(errorContainer).toBe(null);

			await page.type(departingSel, "a");
			let errorMsg = await page.$eval(departingErrorSel, e => e.textContent);
			let isBookDisabled = await page.$eval(bookSel, el => el.disabled);

			expect(isBookDisabled).toBe(true);
			expect(errorMsg).toMatch(/YYYY-MM-DD/);
		});

		it("displays an error message and disables book button if the returning date is invalid", async () => {
			await page.select(tripTypeSel, returnType);
			let isReturnDisabled = await page.$eval(returningSel, el => el.disabled);
			expect(isReturnDisabled).toEqual(false);

			let errorContainer = await page.$(departingErrorSel);
			expect(errorContainer).toBe(null);

			await page.type(returningSel, "a");
			let errorMsg = await page.$eval(returningErrorSel, e => e.textContent);
			let isBookDisabled = await page.$eval(bookSel, el => el.disabled);

			expect(isBookDisabled).toBe(true);
			expect(errorMsg).toMatch(/YYYY-MM-DD/);
		});

		it("booking a one-way flight displays the correct message", async () => {
			const dialogPromise = new Promise((resolve, reject) => {
				/**
				 * @param {import('puppeteer').Dialog} dialog
				 */
				async function dialogHandler(dialog) {
					try {
						await expect(dialog.message()).toMatch(/one-way flight/);
						await dialog.dismiss();
						page.off("dialog", dialogHandler);

						resolve();
					} catch (e) {
						reject(e);
					}
				}

				page.on("dialog", dialogHandler);
			});

			await page.click(bookSel);
			return dialogPromise;
		});

		it("booking a return flight displays the correct message", async () => {
			const dialogPromise = new Promise((resolve, reject) => {
				/**
				 * @param {import('puppeteer').Dialog} dialog
				 */
				async function dialogHandler(dialog) {
					try {
						await expect(dialog.message()).toMatch(/return flight/);
						await dialog.dismiss();
						page.off("dialog", dialogHandler);

						resolve();
					} catch (e) {
						reject(e);
					}
				}

				page.on("dialog", dialogHandler);
			});

			await page.select(tripTypeSel, returnType);
			await page.click(bookSel);
			return dialogPromise;
		});
	});
}
