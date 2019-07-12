import { getAppHtml } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe(`${frameworkName} - 7GUIs Counter`, () => {
		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			await expect(getAppHtml()).resolves.toEqual(
				"<div>0</div><button>count</button>"
			);
		});

		it("increments the counter upon button click", async () => {
			await expect(getAppHtml()).resolves.toEqual(
				"<div>0</div><button>count</button>"
			);

			await page.click("#app button");
			await expect(getAppHtml()).resolves.toEqual(
				"<div>1</div><button>count</button>"
			);

			await page.click("#app button");
			await expect(getAppHtml()).resolves.toEqual(
				"<div>2</div><button>count</button>"
			);
		});
	});
}
