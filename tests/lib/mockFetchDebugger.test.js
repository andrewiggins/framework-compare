/// <reference path="../../scripts/bundles/global.d.ts" />
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

/**
 * @param {string} selector
 * @param {import('puppeteer').Page | ElementHandle<Element>} [parent]
 * @returns {Promise<ElementHandle<Element>>}
 */
async function getElement(selector, parent = page) {
	const el = await parent.$(selector);
	if (!el) {
		throw new Error(`Could not find element with selector "${selector}"`);
	}

	return el;
}

/**
 * @param {string} selector
 * @returns {Promise<ElementHandle<Element>[]>}
 */
async function getElements(selector) {
	return page.$$(selector);
}

describe("MockFetchDebugger", () => {
	const defaultDuration = 500;

	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	async function getDebuggerEl() {
		return /** @type {ElementHandle<MockFetchDebugger>}*/ (
			await getElement("mock-fetch-debugger")
		);
	}

	/** @returns {Promise<MockFetchConfig>} */
	function getConfig() {
		return page.evaluate(() => window.mockFetchConfig);
	}

	async function getInflightList() {
		return getElements("pierce/.request");
	}

	async function getCompletedList() {
		return getElements("pierce/#completed li");
	}

	async function newRequest(url) {
		await page.evaluate(url => {
			window.mockFetch(url);
		}, url);
	}

	async function toggleRequest(index) {
		const requestEl = (await getInflightList())[index];
		const toggleEl = await getElement(".request-btn", requestEl);
		await toggleEl.click();
	}

	beforeEach(async () => {
		const htmlPath = path.join(__dirname, "mockFetchDebuggerTest.html");
		const htmlUrl = pathToFileURL(htmlPath).toString();
		await page.goto(htmlUrl);

		// Create new mock fetch debugger for each test
		await page.evaluate(dur => {
			document.querySelectorAll("mock-fetch-debugger").forEach(el => {
				el.remove();
			});

			window.mockFetchConfig = window.createMockFetchConfig();
			window.mockFetchConfig.durationMs = dur;
			window.mockFetchConfig.log = (...msgs) => console.log(...msgs);

			window.mockFetch = window.createMockFetch(window.mockFetchConfig);

			const fetchDebugger = document.createElement("mock-fetch-debugger");
			fetchDebugger.config = window.mockFetchConfig;
			document.body.appendChild(fetchDebugger);
			window.fetchDebugger = fetchDebugger;
		}, defaultDuration);
	});

	it("initializes mock fetch debugger", async () => {
		const debuggerEl = await getDebuggerEl();
		expect(debuggerEl).toBeTruthy();

		const config = await getConfig();
		expect(config.durationMs).toBe(defaultDuration);
	});

	describe("latency control", () => {
		async function getLatencyRange() {
			return /** @type {ElementHandle<HTMLInputElement>} */ (
				await getElement("pierce/#latency")
			);
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
			await delay(100); // Give a beat for the label to sync with the value

			await expect(getConfig()).resolves.toHaveProperty(
				"durationMs",
				defaultDuration
			);
			await expect(getLatency()).resolves.toBe(defaultDuration);
			await expect(getLatencyLabel()).resolves.toBe("0.5 seconds");

			await (await getLatencyRange()).click();

			await expect(getConfig()).resolves.toHaveProperty("durationMs", 5000);
			await expect(getLatency()).resolves.toBe(5000);
			await expect(getLatencyLabel()).resolves.toBe("5.0 seconds");
		});
	});

	describe("pause new requests", () => {
		async function getPauseNew() {
			return /** @type {ElementHandle<HTMLInputElement>} */ (
				await getElement("pierce/#pause-new")
			);
		}

		async function getChecked() {
			const el = await getPauseNew();
			return el.evaluate(el => el.checked);
		}

		it("toggles config.areNewRequestsPaused", async () => {
			await expect(getChecked()).resolves.toBe(false);
			await expect(getConfig()).resolves.toHaveProperty(
				"areNewRequestsPaused",
				false
			);

			await (await getPauseNew()).click();

			await expect(getChecked()).resolves.toBe(true);
			await expect(getConfig()).resolves.toHaveProperty(
				"areNewRequestsPaused",
				true
			);
		});

		it("pauses new requests when enabled", async () => {
			await (await getPauseNew()).click();
			await newRequest("/req1");

			let inflightList = await getInflightList();
			let firstReq = await inflightList[0].evaluate(el => el.textContent);
			expect(inflightList).toHaveLength(1);
			expect(firstReq).toBe("/req1▶");

			await delay(defaultDuration + 100);

			inflightList = await getInflightList();
			firstReq = await inflightList[0].evaluate(el => el.textContent);
			expect(inflightList).toHaveLength(1);
			expect(firstReq).toBe("/req1▶");
		});
	});

	describe("basic request tracking", () => {
		// TODO:
		// - New requests are added
		// - Request completes after duration
		// - Completed requests are moved to completed list
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
