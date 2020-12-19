import mitt from "mitt";

/** @returns {import('./mockFetch').Config} */
export function createMockFetchConfig() {
	let id = 0;

	/** @type {'auto' | 'interactive'} */
	let currentMode = "auto";

	const events = mitt();

	return {
		durationMs: 3 * 1000,
		areNewRequestsPaused: false,

		get mode() {
			return currentMode;
		},
		set mode(newMode) {
			if (newMode !== currentMode) {
				if (newMode !== "auto" && newMode !== "interactive") {
					throw new Error(`Unsupported mockFetch mode: ${newMode}.`);
				}

				currentMode = newMode;
				scheduleUpdate(this);
			}
		},

		newId: () => `${++id}`,

		// TODO: Build request editing module
		//
		// Normal mode (done):
		//
		// Only keep one timeout for when the next request will need to resolved.
		// When it expires, loop through all requests and resolve all that have
		// completed. When a new request arrives, check if it will expire before the
		// current timeout. If so, replace the current timeout with a new one for
		// the new request.
		//
		// Interactive mode:
		//
		// If the UI control is displayed, instead of relying to timers to resolve
		// requests, we will run a animation loop to animate the UI control and
		// expire requests in progress.
		//
		// To handle the two modes, perhaps the config should have a
		// `scheduleUpdate` function that either sets the timers or schedules the
		// next animation loop.
		//
		// Consider placing the UI in a web-component that individual apps can
		// render inside the app? Or perhaps the app pages can pass a flag to
		// include it in the template. Perhaps createMockFetch and the web-component
		// should take the config as an optional parameter that defaults to a global
		// default config.

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

			// Reset the timer if necessary
			resolveRequests(this);
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

		on(type, handler) {
			events.on(type, handler);
		},

		off(type, handler) {
			events.off(type, handler);
		},

		_emit(type) {
			events.emit(type);
		},

		log() {
			// By default, log nothing?
		}
	};
}

/**
 * @param {import('./mockFetch').Config} config
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

		/** @type {import('./mockFetch').Request} */
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
			request.expiresAt = Date.now() + request.duration;
			scheduleUpdate(config);
		}

		config._emit("update");
		return promise;
	}

	return mockFetch;
}

/**
 * @param {import('./mockFetch').Config} config
 */
function scheduleUpdate(config) {
	if (config.requests.size == 0) {
		return;
	}

	if (config.mode == "interactive") {
		throw new Error("Interactive mode is not implemented");
	} else {
		setTimer(config);
	}
}

/**
 * @param {import('./mockFetch').Config} config
 */
function setTimer(config) {
	/** @type {import('./mockFetch').Request} Request with the next expiration */
	let nextRequest = null;
	for (let request of config.requests.values()) {
		if (
			request.expiresAt != null &&
			(nextRequest == null || request.expiresAt < nextRequest.expiresAt)
		) {
			nextRequest = request;
		}
	}

	if (
		config.timer &&
		(nextRequest == null || nextRequest.expiresAt !== config.timer.expiresAt)
	) {
		// If there is an existing timer, and no next request or the timer expires a
		// different time than the next request, clear the exiting timer.
		window.clearTimeout(config.timer.timeoutId);
		config.timer = null;
	}

	if (
		nextRequest == null ||
		(config.timer && nextRequest.expiresAt === config.timer.expiresAt)
	) {
		return;
	}

	const timeout = nextRequest.expiresAt - Date.now();
	const timeoutId = window.setTimeout(() => {
		config.timer = null;
		resolveRequests(config);
	}, timeout);
	config.timer = { timeoutId, expiresAt: nextRequest.expiresAt };
}

/**
 * @param {import('./mockFetch').Config} config
 */
function resolveRequests(config) {
	const now = Date.now();
	const toRemove = [];

	for (let [id, request] of config.requests.entries()) {
		if (request.expiresAt == null) {
			continue;
		} else if (request.expiresAt - now < 16) {
			// If this request will expire within 16 ms of now (or has already expired)
			// then go ahead and resolve it
			request.resolve();
			toRemove.push(id);
		}
	}

	for (let id of toRemove) {
		config.requests.delete(id);
	}

	scheduleUpdate(config);
	config._emit("update");
}
