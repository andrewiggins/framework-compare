/**
 * @jest-environment jsdom
 */

import { MockFetchController } from "../../scripts/bundles/controls/mockFetchController";

describe("mockFetch library", () => {
	/** @type {MockFetchController} */
	let controller;

	/** @type {MockFetchController["fetch"]} */
	let mockFetch;

	/** @type {string[]} */
	let logs;

	/** @type {(controller: MockFetchController) => string[]} */
	function setupLogger(controller) {
		const logs = [];
		controller.addEventListener("new-request", e => {
			logs.push(`New ${e.request.name}`);
		});
		controller.addEventListener("request-pause", e => {
			logs.push(`Pausing ${e.request.name}`);
		});
		controller.addEventListener("request-resume", e => {
			logs.push(`Resuming ${e.request.name}`);
		});
		controller.addEventListener("request-complete", e => {
			logs.push(`Resolving ${e.request.name}`);
		});

		return logs;
	}

	beforeEach(() => {
		jest.useFakeTimers();

		controller = new MockFetchController();
		mockFetch = controller.fetch;
		logs = setupLogger(controller);
	});

	afterEach(() => {
		// Not sure if this is needed...
		jest.useRealTimers();
	});

	it("should resolve requests with default config", async () => {
		const req = mockFetch("/test/url").then(() => 1);
		jest.advanceTimersByTime(controller.latency + 1);

		const result = await req;
		expect(result).toBe(1);
	});

	it("should resolve two requests created closely together with same duration", async () => {
		const req1 = mockFetch("/test/req1").then(() => 1);
		const req2 = mockFetch("/test/req2").then(() => 2);

		jest.advanceTimersByTime(controller.latency + 1);

		const [result1, result2] = await Promise.all([req1, req2]);
		expect(result1).toBe(1);
		expect(result2).toBe(2);
	});

	it("should resolve two requests created at the same time with longer durations", async () => {
		// Create first request
		const req1Duration = controller.latency;
		const req1 = mockFetch("/test/req1").then(() => 1);

		// Create second request with longer duration
		controller.latency = req1Duration * 2;
		const req2 = mockFetch("/test/req2").then(() => 2);

		// Advance time enough such only first request should complete
		jest.advanceTimersByTime(req1Duration + 1);
		expect(logs).toEqual([
			"New GET /test/req1",
			"New GET /test/req2",
			"Resolving GET /test/req1"
		]);
		expect(await req1).toBe(1);

		// Advance time by remaining time such that second request should complete
		jest.advanceTimersByTime(req1Duration + 1);
		expect(logs).toEqual([
			"New GET /test/req1",
			"New GET /test/req2",
			"Resolving GET /test/req1",
			"Resolving GET /test/req2"
		]);
		expect(await req2).toBe(2);
	});

	it("should resolve two requests created at the same time with shorter durations", async () => {
		// Create first request
		const req1Duration = controller.latency;
		const req1 = mockFetch("/test/req1").then(() => 1);

		// Create second request with shorter duration than first
		controller.latency = req1Duration / 2;
		const req2 = mockFetch("/test/req2").then(() => 2);

		// Advance time such that only second request should complete
		jest.advanceTimersByTime(req1Duration / 2 + 1);
		expect(config.log).toHaveBeenCalledTimes(1);
		expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /test/req2");
		expect(await req2).toBe(2);

		// Advance time by remaining time such that first request should complete
		jest.advanceTimersByTime(req1Duration / 2 + 1);
		expect(config.log).toHaveBeenCalledTimes(2);
		expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /test/req1");
		expect(await req1).toBe(1);
	});

	it("should resolve two requests created far apart", async () => {
		// Create initial request
		const req1 = mockFetch("/test/req1").then(() => 1);

		// Create another request some time later
		jest.advanceTimersByTime(controller.latency / 2);
		const req2 = mockFetch("/test/req2").then(() => 2);

		// Advance time so that all requests should expire
		jest.advanceTimersByTime(controller.latency + 1);

		const [result1, result2] = await Promise.all([req1, req2]);
		expect(result1).toBe(1);
		expect(result2).toBe(2);
	});

	it("should resolve three requests created far apart with varying durations", async () => {
		// Create first request
		const req1Duration = controller.latency;
		const req1 = mockFetch("/test/req1").then(() => 1);

		// Create a second and third request some time later
		jest.advanceTimersByTime(req1Duration / 2);

		// Create second request with double the duration as first
		const req2Duration = req1Duration * 2;
		controller.latency = req2Duration;
		const req2 = mockFetch("/test/req2").then(() => 2);

		// Create third request with half duration than second
		controller.latency = req2Duration / 2;
		const req3 = mockFetch("/test/req3").then(() => 3);

		// Advance time such that only first request should complete
		jest.advanceTimersByTime(req1Duration / 2 + 1);
		expect(config.log).toHaveBeenCalledTimes(1);
		expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /test/req1");
		expect(await req1).toBe(1);

		// Advance time such that only the third request should complete
		jest.advanceTimersByTime(req1Duration / 2 + 1);
		expect(config.log).toHaveBeenCalledTimes(2);
		expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /test/req3");
		expect(await req3).toBe(3);

		// Advance time by remaining time such that second request should complete
		jest.advanceTimersByTime(req1Duration + 1);
		expect(config.log).toHaveBeenCalledTimes(3);
		expect(config.log).toHaveBeenNthCalledWith(3, "Resolving GET /test/req2");
		expect(await req2).toBe(2);
	});

	it("should resolve three requests created far apart with increasing durations", async () => {
		// Create first request
		const req1Duration = controller.latency;
		const req1 = mockFetch("/test/req1").then(() => 1);

		// Create a second and third request some time later
		jest.advanceTimersByTime(req1Duration / 2);

		// Create second request with double the duration as first
		const req2Duration = req1Duration;
		controller.latency = req2Duration;
		const req2 = mockFetch("/test/req2").then(() => 2);

		// Create third request with half duration than second
		controller.latency = req2Duration * 2;
		const req3 = mockFetch("/test/req3").then(() => 3);

		// Advance time such that only first request should complete
		jest.advanceTimersByTime(req1Duration / 2 + 1);
		expect(config.log).toHaveBeenCalledTimes(1);
		expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /test/req1");
		expect(await req1).toBe(1);

		// Advance time such that only the second request should complete
		jest.advanceTimersByTime(req1Duration / 2 + 1);
		expect(config.log).toHaveBeenCalledTimes(2);
		expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /test/req2");
		expect(await req2).toBe(2);

		// Advance time by remaining time such that third request should complete
		jest.advanceTimersByTime(req1Duration + 1);
		expect(config.log).toHaveBeenCalledTimes(3);
		expect(config.log).toHaveBeenNthCalledWith(3, "Resolving GET /test/req3");
		expect(await req3).toBe(3);
	});

	describe("pause & resume", () => {
		it("should pause a request past previous duration and resume request with remaining duration", async () => {
			// Request: ====  ====
			const req1 = mockFetch("/test/req1").then(() => 1);
			config.pause("1");

			jest.advanceTimersByTime(controller.latency + 1);
			expect(config.log).not.toHaveBeenCalled();

			config.resume("1");
			jest.advanceTimersByTime(controller.latency + 1);

			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req1");
			expect(await req1).toBe(1);
		});

		it("should throw an error if request id doesn't exist", async () => {
			expect(() => config.pause("1")).toThrow();
			expect(() => config.resume("1")).toThrow();

			mockFetch("/test/req1").then(() => 1);
			expect(() => config.pause("2")).toThrow();
			expect(() => config.resume("2")).toThrow();
		});

		it("calling pause twice still properly resumes", async () => {
			const req1 = mockFetch("/test/req1").then(() => 1);
			config.pause("1");

			jest.advanceTimersByTime(controller.latency);
			config.pause("1");
			expect(config.log).not.toHaveBeenCalled();

			jest.advanceTimersByTime(controller.latency);
			expect(config.log).not.toHaveBeenCalled();

			config.resume("1");
			jest.advanceTimersByTime(controller.latency + 1);

			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req1");
			expect(await req1).toBe(1);
		});

		it("calling resume on not paused request throws an error", async () => {
			mockFetch("/test/req1").then(() => 1);
			expect(() => config.resume("1")).toThrow();
		});

		it("immediate pause should not block existing requests", async () => {
			// Request 1: =============
			// Request 2:    =====         =====

			const req1 = mockFetch("/test/req1").then(() => 1);
			jest.advanceTimersByTime(controller.latency / 2);

			const req2 = mockFetch("/test/req2").then(() => 2);
			config.pause("2");

			jest.advanceTimersByTime(controller.latency / 2 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req1");
			expect(await req1).toBe(1);

			config.resume("2");
			jest.advanceTimersByTime(controller.latency + 1);

			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req2");
			expect(await req2).toBe(2);
		});

		it("immediate pause should not block new requests", async () => {
			// Request 1: ====        ====
			// Request 2:       ====
			const req1 = mockFetch("/test/req1").then(() => 1);
			config.pause("1");

			jest.advanceTimersByTime(controller.latency / 2);
			const req2 = mockFetch("/test/req2").then(() => 2);

			jest.advanceTimersByTime(controller.latency + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req2");
			expect(await req2).toBe(2);

			config.resume("1");
			jest.advanceTimersByTime(controller.latency + 1);

			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req1");
			expect(await req1).toBe(1);
		});

		it("request1 pauses before request2, and resumes and completes within the request2", async () => {
			// Request 1: ====    ====
			// Request 2:       ========

			// In auto mode for this test, req1 original timer will expire after
			// req1 is paused and get replaced with new timer for req2. However,
			// once req1 is resumed, that timer will get replaced with a new timer
			// for req1 which completes before req2. Once req1 completes, a new
			// timer is created for req2 to complete.

			const req1 = mockFetch("/req1").then(() => 1);

			// Pause req1 after half of its time
			jest.advanceTimersByTime(controller.latency / 2);
			config.pause("1");

			// Wait an additional 1/4 of req1 time before starting request 2
			jest.advanceTimersByTime(controller.latency / 4);
			const req2 = mockFetch("/req2").then(() => 2);

			// Ensure original req1 timer does not fire here (1/2 + 1/4 + 1/4)
			jest.advanceTimersByTime(controller.latency / 4 + 1);
			expect(config.log).not.toHaveBeenCalled();
			config.resume("1");

			// Complete just req1
			jest.advanceTimersByTime(controller.latency / 2 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /req1");
			expect(await req1).toBe(1);

			// Complete req2
			jest.advanceTimersByTime(controller.latency / 4 + 1);
			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /req2");
			expect(await req2).toBe(2);
		});

		it("request1 pauses before request2, resumes within the request2, and completes after request2", async () => {
			// Request 1: ====        ====
			// Request 2:       ========

			const req1 = mockFetch("/req1").then(() => 1);

			// Pause req1 after half of its time
			jest.advanceTimersByTime(controller.latency / 2);
			config.pause("1");

			// Wait an additional 1/4 of req1 time before starting req2
			jest.advanceTimersByTime(controller.latency / 4);
			const req2 = mockFetch("/req2").then(() => 2);

			// Ensure original req1 timer does not fire here (1/2 + 1/4 + 1/4)
			jest.advanceTimersByTime(controller.latency / 4 + 1);
			expect(config.log).not.toHaveBeenCalled();

			// Wait an additional 1/2 of req2 time before resuming req1
			jest.advanceTimersByTime(controller.latency / 2);
			config.resume("1");
			expect(config.log).not.toHaveBeenCalled();

			// Complete req2
			jest.advanceTimersByTime(controller.latency / 4 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /req2");
			expect(await req2).toBe(2);

			// Complete req1
			jest.advanceTimersByTime(controller.latency / 4 + 1);
			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /req1");
			expect(await req1).toBe(1);
		});

		it("delayed pause should not block new requests", async () => {
			// Request 1: ====        ====
			// Request 2:      ======
			const req1 = mockFetch("/test/req1").then(() => 1);

			jest.advanceTimersByTime(controller.latency / 3);
			config.pause("1");

			jest.advanceTimersByTime(controller.latency / 3);
			const req2 = mockFetch("/test/req2").then(() => 2);

			jest.advanceTimersByTime(controller.latency + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req2");
			expect(await req2).toBe(2);

			config.resume("1");
			jest.advanceTimersByTime(controller.latency * (2 / 3) + 1);

			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req1");
			expect(await req1).toBe(1);
		});

		it("request pauses, resumes, and completes within another requests expiration", async () => {
			// Request 1: ================
			// Request 2:   ====    ====

			const req2Duration = controller.latency;
			const req1Duration = controller.latency * 2;
			controller.latency = req1Duration;

			// Create initial request
			const req1 = mockFetch("/req1").then(() => 1);

			// After some time create second request
			jest.advanceTimersByTime(req2Duration / 4);
			controller.latency = req2Duration;
			const req2 = mockFetch("/req2").then(() => 2);

			// After half of req2 duration, pause it
			jest.advanceTimersByTime(req2Duration / 2);
			config.pause("2");

			// Advance time past req2 old timer and ensure it didn't do anything.
			// Resume req2
			jest.advanceTimersByTime(req2Duration / 2 + 1);
			expect(config.log).not.toHaveBeenCalled();
			config.resume("2");

			// Complete req2
			jest.advanceTimersByTime(req2Duration / 2 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /req2");
			expect(await req2).toBe(2);

			// Complete req1
			jest.advanceTimersByTime(req2Duration / 4 + 1);
			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /req1");
			expect(await req1).toBe(1);
		});

		it("request pauses and resumes within another request but completes after", async () => {
			// Request 1: ================
			// Request 2:   ====        ====

			const req2Duration = controller.latency;
			const req1Duration = controller.latency * 2;
			controller.latency = req1Duration;

			// Create initial request
			const req1 = mockFetch("/req1").then(() => 1);

			// After some time create second request
			jest.advanceTimersByTime(req2Duration / 4);
			controller.latency = req2Duration;
			const req2 = mockFetch("/req2").then(() => 2);

			// After half of req2 duration, pause it
			jest.advanceTimersByTime(req2Duration / 2);
			config.pause("2");

			// Advance time past req2 old timer and ensure it didn't do anything.
			// Advance time enough such that req2 will complete after req1.
			jest.advanceTimersByTime(req2Duration + 1);
			expect(config.log).not.toHaveBeenCalled();
			config.resume("2");

			// Complete req1
			jest.advanceTimersByTime(req2Duration / 4 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /req1");
			expect(await req1).toBe(1);

			// Complete req2
			jest.advanceTimersByTime(req2Duration / 4 + 1);
			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /req2");
			expect(await req2).toBe(2);
		});

		it("delayed pause should not block existing requests", async () => {
			// Request 1: =============
			// Request 2:    =====         =====

			const req1 = mockFetch("/test/req1").then(() => 1);
			jest.advanceTimersByTime(controller.latency / 3);

			const req2 = mockFetch("/test/req2").then(() => 2);

			jest.advanceTimersByTime(controller.latency / 3);
			config.pause("2");

			jest.advanceTimersByTime(controller.latency / 3 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req1");
			expect(await req1).toBe(1);

			config.resume("2");
			jest.advanceTimersByTime(controller.latency * (2 / 3) + 1);

			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenCalledWith("Resolving GET /test/req2");
			expect(await req2).toBe(2);
		});
	});

	describe("areNewRequestsPaused", () => {
		it("should pause all new requests", async () => {
			// set to true
			config.areNewRequestsPaused = true;

			// create two requests
			const req1 = mockFetch("/req1").then(() => 1);
			const req2 = mockFetch("/req2").then(() => 2);

			// verified paused
			jest.advanceTimersByTime(controller.latency + 1);
			expect(config.log).not.toHaveBeenCalled();

			// turn off
			config.areNewRequestsPaused = false;

			// create another request
			const req3 = mockFetch("/req3").then(() => 3);

			// verify it resolves
			jest.advanceTimersByTime(controller.latency + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /req3");
			expect(await req3).toBe(3);

			// resume two paused requests
			config.resume("1");
			config.resume("2");

			// verify they resolve
			jest.advanceTimersByTime(controller.latency + 1);
			expect(config.log).toHaveBeenCalledTimes(3);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /req1");
			expect(config.log).toHaveBeenNthCalledWith(3, "Resolving GET /req2");
			expect(await req1).toBe(1);
			expect(await req2).toBe(2);
		});

		it("should not affect exiting requests", async () => {
			const req1 = mockFetch("/req1").then(() => 1);

			jest.advanceTimersByTime(controller.latency / 2);
			config.areNewRequestsPaused = true;
			const req2 = mockFetch("/req2").then(() => 2);

			jest.advanceTimersByTime(controller.latency / 2 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /req1");
			expect(await req1).toBe(1);

			jest.advanceTimersByTime(controller.latency / 2 + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			config.resume("2");

			jest.advanceTimersByTime(controller.latency);
			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /req2");
			expect(await req2).toBe(2);
		});
	});
});
