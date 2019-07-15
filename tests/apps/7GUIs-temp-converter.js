import { getAppHtml, appSel, backspaceInput } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe("7GUIs Temp Converter", () => {
		const cInputSel = appSel("input:first-child");
		const fInputSel = appSel("input:last-child");

		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual(
				`<input type="number"> °c = <input type="number"> °f`
			);
		});

		it("initializes each input to empty string", async () => {
			const initialValues = await page.$$eval(appSel("input"), els =>
				els.map(el => el.value)
			);
			expect(initialValues).toEqual(["", ""]);
		});

		it("updates fahrenheit when celsius is changed", async () => {
			await page.type(cInputSel, "0");
			let cValue = await page.$eval(cInputSel, el => el.value);
			let fValue = await page.$eval(fInputSel, el => el.value);
			expect(cValue).toEqual("0");
			expect(fValue).toEqual("32");

			await backspaceInput(cInputSel);
			await page.type(cInputSel, "100");
			cValue = await page.$eval(cInputSel, el => el.value);
			fValue = await page.$eval(fInputSel, el => el.value);
			expect(cValue).toEqual("100");
			expect(fValue).toEqual("212");
		});

		it("updates celsius when fahrenheit is changed", async () => {
			await page.type(fInputSel, "32");
			let cValue = await page.$eval(cInputSel, el => el.value);
			let fValue = await page.$eval(fInputSel, el => el.value);
			expect(cValue).toEqual("0");
			expect(fValue).toEqual("32");

			await backspaceInput(fInputSel);
			await page.type(fInputSel, "212");
			cValue = await page.$eval(cInputSel, el => el.value);
			fValue = await page.$eval(fInputSel, el => el.value);
			expect(cValue).toEqual("100");
			expect(fValue).toEqual("212");
		});
	});
}
