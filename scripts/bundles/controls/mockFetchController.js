// Exported primarily for typing and testing
export class MockRequest {
	static id = 0; // Public for testing

	/** @type {() => void} */
	#resolver;
	/** @type {() => void} */
	#rejecter;

	/**
	 * @param {string} url Mock URL
	 * @param {RequestInit} [requestInit] Mock request options
	 * @param {{ latency: number; paused: boolean; }} [mockOptions] Mock request options
	 */
	constructor(
		url,
		requestInit = { method: "GET" },
		mockOptions = { latency: 3000, paused: false }
	) {
		/** @type {string} */
		this.id = `${++MockRequest.id}`;
		/** @type {string} Display name of the request */
		this.name = `${requestInit.method} ${url}`;
		/** @type {string} The URL of the request */
		this.url = url;
		/** @type {RequestInit} The init options of the request */
		this.requestInit = requestInit;
		/** @type {number | null} When this request should resolve. If null, request is paused and not scheduled to complete */
		this.expiresAt = mockOptions.paused
			? null
			: Date.now() + mockOptions.latency;
		/** @type {number} Total time in milliseconds this request should wait */
		this.latency = mockOptions.latency;
		/** @type {number} Tracks how much time of duration has elapsed when a request is paused/resumed */
		this.elapsedTime = 0;

		/** @type {Promise<void>} */
		this.promise = new Promise((resolve, reject) => {
			this.#resolver = () => {
				resolve();
			};

			// TODO: Consider how to enable this...
			// this.#rejecter = () => {
			// 	config.log(`Rejecting ${name}`);
			// 	reject();
			// };
		});
	}

	complete() {
		this.#resolver();
	}
}

/**
 * @typedef {"new-request" | "request-pause" | "request-resume" | "request-complete"} MockRequestEventType
 *
 * @typedef MockRequestEvents
 * @property {MockRequestEvent<"new-request">} new-request
 * @property {MockRequestEvent<"request-pause">} request-pause
 * @property {MockRequestEvent<"request-resume">} request-resume
 * @property {MockRequestEvent<"request-complete">} request-complete
 */

/**
 * @template {MockRequestEventType} Type
 */
// Exported primarily for typing
export class MockRequestEvent extends Event {
	/**
	 * @param {Type} type
	 * @param {MockRequest} request
	 */
	constructor(type, request) {
		super(type);
		this.request = request;
	}
}

export class MockFetchController extends EventTarget {
	/**
	 * @typedef {{ expiresAt: number; timeoutId: number; }} MockFetchTimer
	 * @type {MockFetchTimer | null}
	 */
	#timer = null;

	constructor() {
		super();
		/** @type {boolean} */
		this.areNewRequestsPaused = false;
		/** @type {number} */
		this.latency = 3 * 1000;
		/** @type {Map<string, MockRequest>} */
		this.requests = new Map();
	}

	/** @type {(url: string, requestInit?: RequestInit) => Promise<void>} */
	fetch = (url, requestInit) => {
		const request = new MockRequest(url, requestInit, {
			latency: this.latency,
			paused: this.areNewRequestsPaused
		});

		this.requests.set(request.id, request);
		this.dispatchEvent(new MockRequestEvent("new-request", request));

		if (this.areNewRequestsPaused) {
			// TODO: Should we fire a pause event?
		} else {
			this.#scheduleUpdate();
		}

		return request.promise;
	};

	/**
	 * Pause the given request if it is currently inflight
	 * @param {string} id
	 * @returns {void}
	 */
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

		request.elapsedTime = request.latency - (request.expiresAt - now);
		request.expiresAt = null;

		// // Reset the timer if necessary
		// if (this.mode == "auto") {
		// 	// Ensure timer is properly set with the request with the next expiration
		// 	// which could be the request we just updated
		// 	resolveRequests(this, now);
		// }

		this.dispatchEvent(new MockRequestEvent("request-pause", request));
		this.#resolveRequests(now);
	}

	/**
	 * Resume the given request if it was paused
	 * @param {string} id
	 * @returns {void}
	 */
	resume(id) {
		const request = this.requests.get(id);
		if (!request) {
			throw new Error(`No request with id "${id}" exists.`);
		}

		if (request.expiresAt != null) {
			throw new Error(`Request is not paused. Can not resume it.`);
		}

		const now = Date.now();
		const remainingTime = request.latency - request.elapsedTime;
		request.expiresAt = now + remainingTime;

		// if (this.mode == "auto") {
		// 	// Ensure timer is properly set with the request with the next expiration
		// 	// which could be the request we just updated
		// 	resolveRequests(this, now);
		// }

		this.dispatchEvent(new MockRequestEvent("request-resume", request));
		this.#resolveRequests(now);
	}

	/**
	 * Resolve any inflight requests that have completed.
	 *
	 * `now` is a parameter to assist in debugging so that time doesn't continue when
	 * debugging. If it did, requests could "expire" while stepping through code
	 * @param {number} now
	 * @returns {void}
	 */
	#resolveRequests(now) {
		/** @type {MockRequest[]} */
		const toRemove = [];

		for (let [_, request] of this.requests.entries()) {
			if (request.expiresAt == null) {
				continue;
			} else if (request.expiresAt - now < 16) {
				// If this request will expire within 16 ms of now (or has already expired)
				// then go ahead and resolve it
				request.complete();
				this.dispatchEvent(new MockRequestEvent("request-complete", request));

				toRemove.push(request);
			}
		}

		for (let request of toRemove) {
			this.requests.delete(request.id);
		}

		this.#scheduleUpdate();
	}

	/**
	 * Schedule the next timeout to resolve the next set of requests to complete
	 * @returns {void}
	 */
	#scheduleUpdate() {
		// TODO: Do we need a mode? The controller should solely own the request state
		// if (this.requests.size == 0 || this.mode !== "auto") {
		// 	return;
		// }

		if (this.requests.size == 0) {
			return;
		}

		/** @type {number | null} The expiration time of the request that will expire soonest */
		let nextExpiration = null;
		for (let request of this.requests.values()) {
			if (
				request.expiresAt != null &&
				(nextExpiration == null || request.expiresAt < nextExpiration)
			) {
				nextExpiration = request.expiresAt;
			}
		}

		if (
			this.#timer &&
			(nextExpiration == null || nextExpiration !== this.#timer.expiresAt)
		) {
			// If there is an existing timer, and no next request or the timer expires a
			// different time than the next request, clear the exiting timer.
			window.clearTimeout(this.#timer.timeoutId);
			this.#timer = null;
		}

		// TODO: Does this equal `nextExpiration === this.#timer?.expiresAt`?
		if (
			nextExpiration == null ||
			(this.#timer && nextExpiration === this.#timer.expiresAt)
		) {
			return;
		}

		const timeout = nextExpiration - Date.now();
		const timeoutId = window.setTimeout(() => {
			this.#timer = null;
			this.#resolveRequests(Date.now());
		}, timeout);
		this.#timer = { timeoutId, expiresAt: nextExpiration };
	}

	/** @type {<K extends keyof MockRequestEvents>(type: K, listener: (this: Element, ev: MockRequestEvents[K]) => any, options?: boolean | AddEventListenerOptions) => void} */
	// @ts-expect-error We are overriding the default EventTarget#addEventListener type to add stricter type safety
	addEventListener = super.addEventListener;

	/** @type {<K extends keyof MockRequestEvents>(type: K, listener: (this: Element, ev: MockRequestEvents[K]) => any, options?: boolean | EventListenerOptions) => void} */
	// @ts-expect-error We are overriding the default EventTarget#removeEventListener type to add stricter type safety
	removeEventListener = super.removeEventListener;

	/** @type {(event: MockRequestEvent) => boolean} */
	dispatchEvent = super.dispatchEvent;
}
