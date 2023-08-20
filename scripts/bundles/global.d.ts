import {
	Config,
	createMockFetch,
	createMockFetchConfig,
	MockFetchDebugger
} from "./controls/mockFetch";

declare global {
	interface HTMLElementTagNameMap {
		"mock-fetch-debugger": MockFetchDebugger;
	}

	interface Window {
		createMockFetchConfig: typeof createMockFetchConfig;
		createMockFetch: typeof createMockFetch;
		mockFetchConfig: Config;
		mockFetch: ReturnType<typeof createMockFetch>;
		fetchDebugger: MockFetchDebugger;
	}
}
