import { getAppHtml, toHtmlString } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe(`${frameworkName} - Timer`, () => {
		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			let html = await getAppHtml();
			html = html.replace(/progress value="[0-9\.]+"/, 'progress value="0"');
			await expect(html).toEqual(
				<>
					<label>
						Elapsed time: <progress value="0" />
					</label>
					<div>0.0s</div>
					<label>
						Duration: <input max="20000" min="1" type="range" />
					</label>
					<div>
						<button class="btn btn-primary">Reset</button>
					</div>
				</>
			);
		});

		it("initializes duration to 5s", async () => {});

		it("updates the progress as time passes", async () => {});

		it("clicking the reset button resets the timer to 0", async () => {});

		it("decreasing the duration immediately updates the progress", async () => {});

		it("increasing the duration immediately updates the progress", async () => {});
	});
}
