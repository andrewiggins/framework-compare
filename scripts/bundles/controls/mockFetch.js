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
 * @property {() => string} newId
 * @property {Timer | null} timer
 * @property {Map<string, Request>} requests
 * @property {(id: RequestId) => void} pause
 * @property {(id: RequestId) => void} resume
 * @property {(...msg: any[]) => void} log
 */

/** @returns {Config} */
export function createMockFetchConfig() {
	let id = 0;

	return {
		durationMs: 3 * 1000,
		areNewRequestsPaused: false,

		newId: () => `${++id}`,

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
		// Interactive mode:
		//
		// If the UI control is displayed, instead of relying to timers to resolve
		// requests, we will run a animation loop to animate the UI control and expire
		// requests in progress.

		timer: null,

		requests: new Map(),

		pause(id) {
			const request = this.requests.get(id);
			if (!request) {
				throw new Error(`No request with id "${id}" exists.`);
			}

			const now = Date.now();
			if (request.expiresAt == null || now > request.expiresAt) {
				// Request already paused or completed
				return;
			}

			request.elapsedTime = request.duration - (request.expiresAt - now);
			request.expiresAt = null;
		},

		resume(id) {
			const request = this.requests.get(id);
			if (!request) {
				throw new Error(`No request with id "${id}" exists.`);
			}

			if (request.expiresAt != null) {
				throw new Error(`Request is not paused. Can not resume it.`);
			}

			const now = Date.now();
			const remainingTime = request.duration - request.elapsedTime;
			request.expiresAt = now + remainingTime;

			// Ensure timer is properly set with the request with the next expiration
			// which could be the request we just updated
			resolveRequests(this);
		},

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

			// TODO: Consider how to enable this...
			// rejecter = () => {
			// 	config.log(`Rejecting ${name}`);
			// 	reject();
			// };
		});

		/** @type {Request} */
		const request = {
			id: config.newId(),
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
		config.timer = null;
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

	/** @type {Request} Request with the next expiration */
	let nextRequest = null;
	for (let [id, request] of config.requests.entries()) {
		if (request.expiresAt == null) {
			continue;
		} else if (request.expiresAt - now < 16) {
			// If this request will expire within 16 ms of now (or has already expired)
			// then go ahead and resolve it
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
	} else {
		config.timer = null;
	}
}
