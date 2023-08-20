import mitt from "mitt";

/** @returns {import('./mockFetch').Config} */
export function createMockFetchConfig() {
	let id = 0;

	/** @type {'auto' | 'manual'} */
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
				if (newMode !== "auto" && newMode !== "manual") {
					throw new Error(`Unsupported mockFetch mode: ${newMode}.`);
				}

				currentMode = newMode;
				scheduleUpdate(this);
			}
		},

		newId: () => `${++id}`,

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
			if (this.mode == "auto") {
				// Ensure timer is properly set with the request with the next expiration
				// which could be the request we just updated
				resolveRequests(this, now);
			}

			this._emit("update");
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

			if (this.mode == "auto") {
				// Ensure timer is properly set with the request with the next expiration
				// which could be the request we just updated
				resolveRequests(this, now);
			}

			this._emit("update");
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
 * @returns {(url: string, options?: RequestInit) => Promise<void>}
 */
export function createMockFetch(config) {
	// Actual fetch signature:
	// declare function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
	/**
	 * @param {string} url Mock URL
	 * @param {RequestInit} [options] Mock request options
	 * @returns {Promise<void>}
	 */
	function mockFetch(url, options = { method: "GET" }) {
		const name = `${options.method} ${url}`;

		let resolver = () => {};
		let rejecter = () => {};
		/** @type {Promise<void>} */
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
	if (config.requests.size > 0 && config.mode == "auto") {
		setTimer(config);
	}
}

/**
 * @param {import('./mockFetch').Config} config
 */
function setTimer(config) {
	/** @type {number | null} The expiration time of the request that will expire soonest */
	let nextExpiration = null;
	for (let request of config.requests.values()) {
		if (
			request.expiresAt != null &&
			(nextExpiration == null || request.expiresAt < nextExpiration)
		) {
			nextExpiration = request.expiresAt;
		}
	}

	if (
		config.timer &&
		(nextExpiration == null || nextExpiration !== config.timer.expiresAt)
	) {
		// If there is an existing timer, and no next request or the timer expires a
		// different time than the next request, clear the exiting timer.
		window.clearTimeout(config.timer.timeoutId);
		config.timer = null;
	}

	if (
		nextExpiration == null ||
		(config.timer && nextExpiration === config.timer.expiresAt)
	) {
		return;
	}

	const timeout = nextExpiration - Date.now();
	const timeoutId = window.setTimeout(() => {
		config.timer = null;
		resolveRequests(config, Date.now());
		config._emit("update");
	}, timeout);
	config.timer = { timeoutId, expiresAt: nextExpiration };
}

/**
 * `now` is a paramter to assist in debugging so that time doesn't continue when
 * debugging. If it did, requests could "expire" while stepping through code
 * @param {import('./mockFetch').Config} config
 * @param {number} now
 */
function resolveRequests(config, now) {
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
}
