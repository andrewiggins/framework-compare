/**
 * @jest-environment jsdom
 */

import {
	createMockFetchConfig,
	createMockFetch
} from "../../scripts/bundles/controls/mockFetch";

describe("mockFetch library", () => {
	/** @type {ReturnType<createMockFetchConfig> & { log: jest.Mock; }} */
	let config;

	/** @type {ReturnType<createMockFetch>} */
	let mockFetch;

	beforeEach(() => {
		jest.useFakeTimers("modern");

		// @ts-expect-error
		config = createMockFetchConfig();
		config.log = jest.fn();

		mockFetch = createMockFetch(config);
	});

	afterEach(() => {
		// Not sure if this is needed...
		jest.useRealTimers();
	});

	describe("auto mode", () => {
		it("should resolve requests with default config", async () => {
			// @ts-expect-error
			config = createMockFetchConfig();
			mockFetch = createMockFetch(config);

			const req = mockFetch("/test/url").then(() => 1);
			jest.advanceTimersByTime(config.durationMs + 1);

			const result = await req;
			expect(result).toBe(1);
		});

		it("should resolve two requests created closely together with same duration", async () => {
			const req1 = mockFetch("/test/req1").then(() => 1);
			const req2 = mockFetch("/test/req2").then(() => 2);

			jest.advanceTimersByTime(config.durationMs + 1);

			const [result1, result2] = await Promise.all([req1, req2]);
			expect(result1).toBe(1);
			expect(result2).toBe(2);
		});

		it("should resolve two requests created at the same time with longer durations", async () => {
			// Create first request
			const req1Duration = config.durationMs;
			const req1 = mockFetch("/test/req1").then(() => 1);

			// Create second request with longer duration
			config.durationMs = req1Duration * 2;
			const req2 = mockFetch("/test/req2").then(() => 2);

			// Advance time enough such only first request should complete
			jest.advanceTimersByTime(req1Duration + 1);
			expect(config.log).toHaveBeenCalledTimes(1);
			expect(config.log).toHaveBeenNthCalledWith(1, "Resolving GET /test/req1");
			expect(await req1).toBe(1);

			// Advance time by remaining time such that second request should complete
			jest.advanceTimersByTime(req1Duration + 1);
			expect(config.log).toHaveBeenCalledTimes(2);
			expect(config.log).toHaveBeenNthCalledWith(2, "Resolving GET /test/req2");
			expect(await req2).toBe(2);
		});

		it("should resolve two requests created at the same time with shorter durations", async () => {
			// Create first request
			const req1Duration = config.durationMs;
			const req1 = mockFetch("/test/req1").then(() => 1);

			// Create second request with shorter duration than first
			config.durationMs = req1Duration / 2;
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
			jest.advanceTimersByTime(config.durationMs / 2);
			const req2 = mockFetch("/test/req2").then(() => 2);

			// Advance time so that all requests should expire
			jest.advanceTimersByTime(config.durationMs + 1);

			const [result1, result2] = await Promise.all([req1, req2]);
			expect(result1).toBe(1);
			expect(result2).toBe(2);
		});

		it("should resolve three requests created far apart with varying durations", async () => {
			// Create first request
			const req1Duration = config.durationMs;
			const req1 = mockFetch("/test/req1").then(() => 1);

			// Create a second and third request some time later
			jest.advanceTimersByTime(req1Duration / 2);

			// Create second request with double the duration as first
			const req2Duration = req1Duration * 2;
			config.durationMs = req2Duration;
			const req2 = mockFetch("/test/req2").then(() => 2);

			// Create third request with half duration than second
			config.durationMs = req2Duration / 2;
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
			const req1Duration = config.durationMs;
			const req1 = mockFetch("/test/req1").then(() => 1);

			// Create a second and third request some time later
			jest.advanceTimersByTime(req1Duration / 2);

			// Create second request with double the duration as first
			const req2Duration = req1Duration;
			config.durationMs = req2Duration;
			const req2 = mockFetch("/test/req2").then(() => 2);

			// Create third request with half duration than second
			config.durationMs = req2Duration * 2;
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
	});

	describe("interactive mode", () => {});
});
