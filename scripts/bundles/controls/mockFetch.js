let id = 0;
const newId = () => `${++id}`;

/**
 * @typedef Timer
 * @property {number} expiresAt
 * @property {number} timeoutId
 */

/**
 * @typedef {string} RequestId
 *
 * @typedef Request
 * @property {RequestId} id
 * @property {number | null} expiresAt When this request should resolve. If
 * null, request is paused and not scheduled to complete
 * @property {number} duration Total time this request should wait
 * @property {number | null} elapsedTime Tracks how much time of duration has
 * elapsed when a request is paused/resumed
 * @property {string} name Display name of request
 * @property {string} url
 * @property {RequestInit} options
 * @property {Promise<void>} promise
 * @property {() => void} resolve
 * @property {() => void} reject
 */

/**
 * @typedef Config
 * @property {number} durationMs
 * @property {boolean} areNewRequestsPaused
 * @property {Timer | null} timer
 * @property {Map<string, Request>} requests
 * @property {(id: RequestId) => void} pause
 * @property {(id: RequestId) => void} resume
 * @property {(...msg: any[]) => void} log
 */

/** @returns {Config} */
export function createMockFetchConfig() {
	return {
		durationMs: 3 * 1000,
		areNewRequestsPaused: false,

		// TODO: Build request editing module
		//
		// Normal mode:
		//
		// Only keep one timeout for when the next request will need to resolved. When
		// it expires, loop through all requests and resolve all that have completed.
		// When a new request arrives, check if it will expire before the current
		// timeout. If so, replace the current timeout with a new one for the new
		// request.
		//
		// User Control mode:
		//
		// If the UI control is displayed, instead of relying to timers to resolve
		// requests, we will run a animation loop to animate the UI control and expire
		// requests in progress.

		// Consider using a buffer (16 ms?) for detecting if a request should complete
		// now or not.

		timer: null,

		requests: new Map(),

		pause(id) {},

		resume(id) {},

		log(...msg) {}
	};
}

/**
 * @param {Config} config
 */
export function createMockFetch(config) {
	/**
	 * @param {string} url Mock URL
	 * @param {RequestInit} [options] Mock request options
	 * @returns {Promise<void>}
	 */
	function mockFetch(url, options = { method: "GET" }) {
		const name = `${options.method} ${url}`;

		let resolver, rejecter;
		const promise = new Promise((resolve, reject) => {
			resolver = () => {
				config.log(`Resolving ${name}`);
				resolve();
			};

			rejecter = () => {
				config.log(`Rejecting ${name}`);
				reject();
			};
		});

		/** @type {Request} */
		const request = {
			id: newId(),
			duration: config.durationMs,
			expiresAt: null,
			elapsedTime: 0,
			name,
			url,
			options,
			promise,
			resolve: resolver,
			reject: rejecter
		};

		config.requests.set(request.id, request);

		if (!config.areNewRequestsPaused) {
			const now = Date.now();
			const expiresAt = now + request.duration;
			request.expiresAt = expiresAt;

			// If there is no timer or this request finishes faster than the current
			// timer, setup a new timer
			if (config.timer == null || request.expiresAt < config.timer.expiresAt) {
				setTimer(config, request, now);
			}
		}

		return promise;
	}

	return mockFetch;
}

/**
 * @param {Config} config
 * @param {Request} request
 * @param {number} now
 */
function setTimer(config, request, now) {
	if (config.timer) {
		window.clearTimeout(config.timer.timeoutId);
	}

	const timeoutId = window.setTimeout(
		() => resolveRequests(config),
		request.expiresAt - now
	);
	config.timer = { timeoutId, expiresAt: request.expiresAt };
}

/**
 * @param {Config} config
 */
function resolveRequests(config) {
	const now = Date.now();
	const toRemove = [];

	/** @type {Request} */
	let nextRequest = null;
	for (let [id, request] of config.requests.entries()) {
		// If this request will expire within 16 ms of now (or has already expired)
		// then go ahead and resolve it
		if (request.expiresAt - now < 16) {
			request.resolve();
			toRemove.push(id);
		} else if (
			nextRequest == null ||
			request.expiresAt < nextRequest.expiresAt
		) {
			nextRequest = request;
		}
	}

	for (let id of toRemove) {
		config.requests.delete(id);
	}

	if (nextRequest) {
		setTimer(config, nextRequest, now);
	}
}
