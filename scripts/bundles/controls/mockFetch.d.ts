interface Timer {
	expiresAt: number;
	timeoutId: number;
}

type RequestId = string;

interface Request {
	id: RequestId;
	/** When this request should resolve. If null, request is paused and not scheduled to complete */
	expiresAt: number | null;
	/** Total time this request should wait */
	duration: number;
	/** Tracks how much time of duration has elapsed when a request is paused/resumed */
	elapsedTime: number | null;
	/** Display name of request */
	name: string;
	url: string;
	options: RequestInit;
	promise: Promise<void>;
	resolve: () => void;
	reject: () => void;
}

type MockFetchEventType = "update";

interface Config {
	durationMs: number;
	areNewRequestsPaused: boolean;
	mode: "auto" | "interactive";
	timer: Timer | null;
	requests: Map<string, Request>;
	newId(): string;
	pause(id: RequestId): void;
	resume(id: RequestId): void;
	on(type: MockFetchEventType, handler: () => void): void;
	off(type: MockFetchEventType, handler: () => void): void;
	log(...msg: any[]): void;
	_emit(type: MockFetchEventType): void;
}

export function createMockFetchConfig(): Config;
export function createMockFetch(
	config: Config
): (url: string, options?: RequestInit) => Promise<void>;
