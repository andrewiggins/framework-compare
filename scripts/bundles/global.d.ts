import {
	Config,
	createMockFetch,
	MockFetchDebugger
} from "./controls/mockFetch";

declare global {
	interface HTMLElementTagNameMap {
		"mock-fetch-debugger": MockFetchDebugger;
	}

	interface Window {
		mockFetchConfig: Config;
		mockFetch: ReturnType<typeof createMockFetch>;
		fetchDebugger: MockFetchDebugger;
	}
}
