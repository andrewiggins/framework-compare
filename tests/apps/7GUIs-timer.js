import { delay, getAppHtml, appSel, toHtmlString, minifyHtml } from "../util";

/**
 * @param {string} frameworkName
 * @param {() => Promise<any>} appSetup
 */
export default function run(frameworkName, appSetup) {
	describe("Timer", () => {
		const progressSel = appSel("progress");
		const elapsedSel = appSel("div.elapsed");
		const durationInputSel = appSel("input[type=range]");
		const resetSel = appSel("button");

		function getProgress(page) {
			return Promise.all([
				page.$eval(progressSel, el => parseFloat(el.value)),
				page.$eval(elapsedSel, el => parseFloat(el.textContent))
			]);
		}

		async function changeDuration(page, duration) {
			const rect = await page.$eval(durationInputSel, el => {
				const rect = el.getBoundingClientRect();
				return {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height
				};
			});

			await page.mouse.click(
				rect.x + rect.width * duration,
				rect.y + rect.height / 2
			);
		}

		beforeEach(async () => {
			await appSetup();
		});

		it("renders the correct HTML", async () => {
			let html = await getAppHtml();
			html = html.replace(/"elapsed">(-?[0-9.]+)s</, (match, elapsedValue) => {
				expect(Math.abs(parseFloat(elapsedValue))).toBeLessThanOrEqual(0.1);
				return '"elapsed">0.0s<';
			});

			const expectedHtml = minifyHtml(
				<>
					<label>
						Elapsed time: <progress />
					</label>
					<div class="elapsed">0.0s</div>
					<label>
						Duration: <input type="range" min="1" max="20000" />
					</label>
					<div>
						<button class="btn btn-primary">Reset</button>
					</div>
				</>
			);
			await expect(html).toEqual(expectedHtml);
		});

		it("initializes duration to 5s", async () => {
			const duration = await page.$eval(durationInputSel, el => el.value);
			expect(duration).toEqual("5000");
		});

		it("updates the progress as time passes", async () => {
			let [progress, elapsed] = await getProgress(page);
			expect(progress).toBeLessThanOrEqual(0.1);
			expect(elapsed).toBeLessThanOrEqual(0.1);

			await delay(1100);

			[progress, elapsed] = await getProgress(page);
			expect(progress).toBeGreaterThanOrEqual(0.1);
			expect(elapsed).toBeGreaterThanOrEqual(1.0);
		});

		it("clicking the reset button resets the timer to 0", async () => {
			let [progress, elapsed] = await getProgress(page);
			expect(progress).toBeLessThanOrEqual(0.1);
			expect(elapsed).toBeLessThanOrEqual(0.1);

			await delay(1100);

			[progress, elapsed] = await getProgress(page);
			expect(progress).toBeGreaterThanOrEqual(0.1);
			expect(elapsed).toBeGreaterThanOrEqual(1.0);

			await page.click(resetSel);

			[progress, elapsed] = await getProgress(page);
			expect(progress).toBeLessThanOrEqual(0.1);
			expect(elapsed).toBeLessThanOrEqual(0.1);

			// Should continue running
			await delay(600);

			[progress, elapsed] = await getProgress(page);
			expect(progress).toBeGreaterThanOrEqual(0.05);
			expect(elapsed).toBeGreaterThanOrEqual(0.5);
		});

		it("decreasing the duration immediately updates the progress", async () => {
			let [progress, elapsed] = await getProgress(page);
			expect(progress).toBeLessThanOrEqual(0.1);

			await delay(1100);

			[progress] = await getProgress(page);
			expect(progress).toBeGreaterThanOrEqual(0.1);

			await changeDuration(page, 0.125);

			[progress] = await getProgress(page);
			expect(progress).toBeGreaterThan(0.5);

			await delay(1100);

			[progress, elapsed] = await getProgress(page);
			expect(elapsed).toBeGreaterThan(1.3);
		});

		it("increasing the duration immediately updates the progress", async () => {
			let [progress, elapsed] = await getProgress(page);
			expect(progress).toBeLessThanOrEqual(0.1);

			await delay(1100);

			[progress] = await getProgress(page);
			expect(progress).toBeGreaterThanOrEqual(0.1);

			await changeDuration(page, 0.875);

			[progress] = await getProgress(page);
			expect(progress).toBeLessThanOrEqual(0.1);

			// Should continue running
			await delay(1100);

			[progress, elapsed] = await getProgress(page);
			expect(elapsed).toBeGreaterThan(1.5);
		});
	});
}
