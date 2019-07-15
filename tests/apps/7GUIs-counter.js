import { getAppHtml, toHtmlString } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe("7GUIs Counter", () => {
		const getMarkup = count => (
			<button class="btn badge" data-badge={count} style="margin-top: 0.5rem;">
				count: {count}
			</button>
		);

		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual(getMarkup(0));
		});

		it("increments the counter upon button click", async () => {
			await expect(getAppHtml()).resolves.toEqual(getMarkup(0));

			await page.click("#app button");
			await expect(getAppHtml()).resolves.toEqual(getMarkup(1));

			await page.click("#app button");
			await expect(getAppHtml()).resolves.toEqual(getMarkup(2));
		});
	});
}
