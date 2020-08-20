import { getAppHtml } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe("Hello World", () => {
		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual("<div>Hello World!</div>\n");
		});
	});
}
