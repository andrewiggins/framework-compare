let id = 0;

const config = {
	durationMs: 3 * 1000,
	areNewRequestsPaused: false,
	// TODO: Build request editing module
	// /**
	//  * @typedef {{ id: number; url: string; options: RequestInit; timeoutId: number; elapsed: number; duration: number; }} RequestData
	//  */
	// requests: {},
	// /**
	//  * @param {number} id
	//  */
	// pause(id) {},
	// /**
	//  * @param {number} id
	//  */
	// resume(id) {},
	log(msg) {
		console.log(msg);
	}
};

/**
 * @param {string} url Mock URL
 * @param {RequestInit} [options] Mock request options
 */
function mockFetch(url, options = { method: "GET" }) {
	let resolve, reject;
	const promise = new Promise((r1, r2) => {
		resolve = () => {
			config.log(`Resolving request ${options.method} ${url}`);
			r1();
		};

		reject = () => {
			config.log(`Rejecting request ${options.method} ${url}`);
			r2();
		};
	});

	/** @type {number} */
	let timeoutId = null;
	const duration = config.durationMs;
	if (!config.areNewRequestsPaused) {
		config.log(`Starting request ${options.method} ${url}`);
		timeoutId = setTimeout(resolve, duration);
	}

	// /** @type {RequestData} */
	// const request = {
	// 	id: id++,
	// 	url,
	// 	options,
	// 	timeoutId,
	// 	duration,
	// 	elapsed: 0
	// };

	// config.requests[request.id] = request;

	return promise;
}

export function installMockFetch() {
	window.mockFetch = mockFetch;
	window.mockFetchConfig = config;
}
