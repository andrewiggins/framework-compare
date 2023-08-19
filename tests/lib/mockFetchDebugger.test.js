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

	async function getPauseNew() {
		return /** @type {ElementHandle<HTMLInputElement>} */ (
			await getElement("pierce/#pause-new")
		);
	}

	async function getPausedNewChecked() {
		const el = await getPauseNew();
		return el.evaluate(el => el.checked);
	}

	/** @type {(config: Partial<MockFetchConfig>) => Promise<void>} */
	async function setupNewDebugger(customConfig) {
		await page.evaluate(config => {
			document.querySelectorAll("mock-fetch-debugger").forEach(el => {
				el.remove();
			});

			window.mockFetchConfig = { ...window.createMockFetchConfig(), ...config };
			window.mockFetchConfig.log = (...msgs) => console.log(...msgs);

			window.mockFetch = window.createMockFetch(window.mockFetchConfig);

			const fetchDebugger = document.createElement("mock-fetch-debugger");
			fetchDebugger.config = window.mockFetchConfig;
			document.body.appendChild(fetchDebugger);
			window.fetchDebugger = fetchDebugger;
		}, customConfig);
	}

	beforeEach(async () => {
		const htmlPath = path.join(__dirname, "mockFetchDebuggerTest.html");
		const htmlUrl = pathToFileURL(htmlPath).toString();
		await page.goto(htmlUrl);

		// Create new mock fetch debugger for each test
		await setupNewDebugger({ durationMs: defaultDuration });
	});

	it("initializes mock fetch debugger", async () => {
		const debuggerEl = await getDebuggerEl();
		expect(debuggerEl).toBeTruthy();

		const config = await getConfig();
		expect(config.durationMs).toBe(defaultDuration);
	});

	it("new requests complete as expected", async () => {
		await newRequest("/req1");
		await newRequest("/req2");

		let inflightList = await getInflightList();
		expect(inflightList).toHaveLength(2);

		await delay(defaultDuration + 10);

		inflightList = await getInflightList();
		expect(inflightList).toHaveLength(0);

		const completedList = await getCompletedList();
		expect(completedList).toHaveLength(2);

		const firstReq = await completedList[0].evaluate(el => el.textContent);
		expect(firstReq).toBe("/req1");

		const secondReq = await completedList[1].evaluate(el => el.textContent);
		expect(secondReq).toBe("/req2");
	});

	it("pauses and resumes requests as expected", async () => {
		await newRequest("/req1");
		await newRequest("/req2");

		await toggleRequest(0);

		let inflightList = await getInflightList();
		let completedList = await getCompletedList();
		expect(inflightList).toHaveLength(2);
		expect(completedList).toHaveLength(0);

		await delay(defaultDuration + 10);

		inflightList = await getInflightList();
		completedList = await getCompletedList();
		expect(inflightList).toHaveLength(1);
		expect(completedList).toHaveLength(1);

		await toggleRequest(0);
		await delay(defaultDuration + 10);

		inflightList = await getInflightList();
		completedList = await getCompletedList();
		expect(inflightList).toHaveLength(0);
		expect(completedList).toHaveLength(2);

		const firstCompleted = await completedList[0].evaluate(
			el => el.textContent
		);
		const secondCompleted = await completedList[1].evaluate(
			el => el.textContent
		);
		expect(firstCompleted).toBe("/req2");
		expect(secondCompleted).toBe("/req1");
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

	it("pauses new requests when enabled", async () => {
		await expect(getPausedNewChecked()).resolves.toBe(false);
		await expect(getConfig()).resolves.toHaveProperty(
			"areNewRequestsPaused",
			false
		);

		await (await getPauseNew()).click();

		await expect(getPausedNewChecked()).resolves.toBe(true);
		await expect(getConfig()).resolves.toHaveProperty(
			"areNewRequestsPaused",
			true
		);

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

	describe("0 latency", () => {
		beforeEach(async () => {
			await setupNewDebugger({ durationMs: 0 });
			await expect(getConfig()).resolves.toHaveProperty("durationMs", 0);
		});

		it("requests are immediately completed", async () => {
			await newRequest("/req1");

			const inflightList = await getInflightList();
			expect(inflightList).toHaveLength(0);

			const completedList = await getCompletedList();
			expect(completedList).toHaveLength(1);

			const firstReq = await completedList[0].evaluate(el => el.textContent);
			expect(firstReq).toBe("/req1");
		});

		it("requested are paused until clicked when areNewRequestPaused is enabled", async () => {
			await (await getPauseNew()).click();

			await newRequest("/req1");

			const inflightList = await getInflightList();
			expect(inflightList).toHaveLength(1);

			const firstReq = await inflightList[0].evaluate(el => el.textContent);
			expect(firstReq).toBe("/req1▶");

			await toggleRequest(0);
			await delay(10);

			const completedList = await getCompletedList();
			expect(completedList).toHaveLength(1);

			const firstCompleted = await completedList[0].evaluate(
				el => el.textContent
			);
			expect(firstCompleted).toBe("/req1");
		});
	});
});
