import { getAppHtml } from "../util";

/**
 * @param {() => Promise<any>} appSetup
 */
export default function run(appSetup) {
	describe("Hello World", () => {
		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual("<div>Hello World!</div>");
		});
	});
}
