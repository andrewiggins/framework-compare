import { getAppHtml, toHtmlString, appSel } from "../util";

/**
 * @param {() => Promise<any>} appSetup
 */
export default function run(appSetup) {
	describe("7GUIs Flight Booker", () => {
		const tripTypeSel = appSel("#trip-type");
		const departingSel = appSel("#departing-date");
		const returningSel = appSel("#returning-date");
		const bookSel = appSel("button");

		const oneWayType = "one-way";
		const returnType = "return";

		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual(
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
						<label class="form-label" for="departing-date">
							Departing
						</label>
						<input id="departing-date" class="form-input" type="date" />
					</div>
					<div class="form-group">
						<label class="form-label" for="returning-date">
							Returning
						</label>
						<input
							id="returning-date"
							class="form-input"
							type="date"
							disabled=""
						/>
					</div>
					<div class="form-group">
						<button class="btn btn-primary">book</button>
					</div>
				</>
			);
		});

		it("initializes with one-way flight selected", async () => {
			// Default trip type is one-way
			const tripType = await page.$eval(tripTypeSel, el => el.value);
			expect(tripType).toEqual("one-way");

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

		it.skip("disables the book button if the return flight input is strictly before the departing flight", async () => {
			// TODO: Interacting with date controls in Chrome is bad. Change these to text fields

			await page.select(tripTypeSel, returnType);
			let isReturnDisabled = await page.$eval(returningSel, el => el.disabled);
			expect(isReturnDisabled).toEqual(false);

			await page.type(returningSel, "07/10/2018");
			const returnDate = await page.$eval(returningSel, el => el.value);
			let isBookDisabled = await page.$eval(bookSel, el => el.disabled);

			expect(returnDate).toEqual("07/10/2018");
			expect(isBookDisabled).toEqual(true);
		});

		it("booking a one-way flight displays the correct message", async () => {
			const dialogPromise = new Promise((resolve, reject) => {
				/**
				 * @param {import('puppeteer').Dialog} dialog
				 */
				async function dialogHandler(dialog) {
					try {
						await expect(dialog.message()).toMatch(/one-way trip flight/);
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
						await expect(dialog.message()).toMatch(/round trip flight/);
						await dialog.dismiss();
						page.off("dialog", dialogHandler);

						resolve();
					} catch (e) {
						reject(e);
					}
				}

				page.on("dialog", dialogHandler);
			});

			await page.select(tripTypeSel, "return");
			await page.click(bookSel);
			return dialogPromise;
		});
	});
}
