import path from "path";
import { pathToFileURL } from "url";

// For debugging
// jest.setTimeout(5 * 60 * 1000);

/**
 * @typedef {import('../../scripts/bundles/controls/mockFetch').Config} MockFetchConfig
 * @typedef {import('../../scripts/bundles/controls/mockFetch').MockFetchDebugger} MockFetchDebugger
 */
/**
 * @typedef {import('puppeteer').ElementHandle<T>} ElementHandle
 * @template {Node} T
 */

describe("MockFetchDebugger", () => {
	/** @returns {Promise<ElementHandle<MockFetchDebugger>>} */
	async function getDebuggerEl() {
		const el = await page.$("mock-fetch-debugger");
		if (!el) {
			throw new Error(`Could not find mock-fetch-debugger element.`);
		}

		return /** @type {ElementHandle<MockFetchDebugger>} */ (el);
	}

	/** @returns {Promise<MockFetchConfig>} */
	function getConfig() {
		// @ts-expect-error Need to update Window interface to include mockFetchConfig
		return page.evaluate(() => window.mockFetchConfig);
	}

	beforeEach(async () => {
		const htmlPath = path.join(__dirname, "mockFetchDebuggerTest.html");
		const htmlUrl = pathToFileURL(htmlPath).toString();
		await page.goto(htmlUrl);
	});

	it("initializes mock fetch debugger", async () => {
		const debuggerEl = await getDebuggerEl();
		expect(debuggerEl).toBeTruthy();

		const config = await getConfig();
		expect(config.durationMs).toBe(3000);
	});

	describe("latency control", () => {
		async function getLatencyRange() {
			const element = await page.$("pierce/#latency");
			if (!element) {
				throw new Error(`Could not find latency range element.`);
			}

			return /** @type {ElementHandle<HTMLInputElement>} */ (element);
		}

		async function getLatency() {
			const latencyEl = await getLatencyRange();
			return latencyEl.evaluate(el => el.valueAsNumber);
		}

		async function getLatencyLabel() {
			const latencyEl = await page.$("pierce/#latency-label");
			return latencyEl?.evaluate(el => el.textContent);
		}

		it("adjust latency range", async () => {
			await expect(getLatency()).resolves.toBe(3000);
			await expect(getLatencyLabel()).resolves.toBe("3.0 seconds");
			await expect(getConfig()).resolves.toHaveProperty("durationMs", 3000);

			await (await getLatencyRange()).click();

			await expect(getLatency()).resolves.toBe(5000);
			await expect(getLatencyLabel()).resolves.toBe("5.0 seconds");
			await expect(getConfig()).resolves.toHaveProperty("durationMs", 5000);
		});
	});

	describe("pause new requests", () => {
		const pauseNewSel = "pierce/#pause-new";
		// @ts-ignore
		const getChecked = () => page.$eval(pauseNewSel, el => el.checked);

		it("toggles config.areNewRequestsPaused", async () => {
			await expect(getChecked()).resolves.toBe(false);
			await expect(getConfig()).resolves.toHaveProperty(
				"areNewRequestsPaused",
				false
			);

			await page.click(pauseNewSel);

			await expect(getChecked()).resolves.toBe(true);
			await expect(getConfig()).resolves.toHaveProperty(
				"areNewRequestsPaused",
				true
			);
		});

		// TODO:
		// - test to ensure new requests are added to inflight list but aren't
		//   completed after duration
	});

	describe("basic request tracking", () => {
		// TODO:
		// Add tests for show=true:
		// - New requests are added
		// - Request completes after duration
		// - Completed requests are moved to completed list
		//
		// Add tests for after setting show=false:
		// - New requests are completed after duration
		// - Completed requests are completed
		//
		// Tests for show=true then show = false:
		// - new requests are added to list when show=true
		// - show = false
		// - requests still complete
		//
		// Tests for show=false then show=true
		// - once show = true, requests should show in list
		// - requests should move to completed list after duration
	});

	describe("pause & resume", () => {
		// TODO:
		// - Ensure pressing pause pauses a request
		// - Ensure resuming a paused request completes
	});

	describe("0 latency", () => {
		// TODO:
		// - Basic test to ensure new requests are sent directly to completed
		// - new-paused = true: Basic test to ensure new requests are inflight until
		//   clicked and show up in completed
	});
});
