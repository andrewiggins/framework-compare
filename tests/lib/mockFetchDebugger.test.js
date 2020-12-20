import path from "path";
import { pathToFileURL } from "url";

/**
 * @typedef {import('../../scripts/bundles/controls/mockFetch').Config} MockFetchConfig
 * @typedef {import('../../scripts/bundles/controls/mockFetch').MockFetchDebugger} MockFetchDebugger
 */

describe("MockFetchDebugger", () => {
	/** @returns {Promise<import("puppeteer").ElementHandle<MockFetchDebugger>>} */
	function getDebuggerEl() {
		return page.$("mock-fetch-debugger");
	}

	function getRoot() {
		return page.$("pierce/#root");
	}

	/** @returns {Promise<MockFetchConfig>} */
	function getConfig() {
		// @ts-ignore
		return page.evaluate(() => window.mockFetchConfig);
	}

	beforeEach(async () => {
		const htmlPath = path.join(__dirname, "mockFetchDebuggerTest.html");
		const htmlUrl = pathToFileURL(htmlPath).toString();
		await page.goto(htmlUrl);
	});

	it("initializes mock fetch debugger", async () => {
		const debuggerEl = await getDebuggerEl();
		expect(debuggerEl.evaluate(el => el.show)).resolves.toBe(true);

		const root = await getRoot();
		expect(root.evaluate(el => el.className)).resolves.toBe("show dialog");

		const config = await getConfig();
		expect(config.durationMs).toBe(3000);
	});

	describe.skip("latency control", () => {
		async function getLatency() {
			const latencyEl = await page.$("pierce/#latency");
			// @ts-ignore
			return latencyEl.evaluate(el => el.valueAsNumber);
		}

		async function getLatencyLabel() {
			const latencyEl = await page.$("pierce/#latency-label");
			return latencyEl.evaluate(el => el.textContent);
		}

		it("adjust config.durationMs", async () => {
			await expect(getLatency()).resolves.toBe(3000);
			await expect(getLatencyLabel()).resolves.toBe("3.0 seconds");
			await expect(getConfig()).resolves.toHaveProperty("durationMs", 3000);

			// TODO: Figure out how to manipulate range input
			// await page.$eval("pierce/#latency", el => (el.valueAsNumber = 5000));

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
