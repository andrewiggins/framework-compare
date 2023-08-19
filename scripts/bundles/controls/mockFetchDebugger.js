/// <reference path="jsx.d.ts" />

/** @jsx h */

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * @param {string} tag
 * @param {Record<string, string>} attributes
 * @param  {Array<HTMLElement | string>} children
 * @returns {HTMLElement}
 */
function h(tag, attributes, ...children) {
	const element = document.createElement(tag);

	for (let attr in attributes) {
		if (hasOwn.call(attributes, attr)) {
			if (attr in element) {
				element[attr] = attributes[attr];
			} else {
				element.setAttribute(attr, attributes[attr]);
			}
		}
	}

	for (let child of children) {
		if (typeof child == "string") {
			element.appendChild(document.createTextNode(child));
		} else {
			element.appendChild(child);
		}
	}

	return element;
}

class DraggableDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				display: block;
				position: fixed;
				top: 0;
				left: 0;
				z-index: 9999;

				border: 1px solid black;
				border-radius: 8px;
				background-color: white;

				/* https://getcssscan.com/css-box-shadow-examples */
				box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
			}

			:host([hidden]) { display: none; }

			button {
				display: inline-block;
				border: 0;
				padding: 0;
				background: none;
				font-size: inherit;
				font-family: -apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif;
			}

			.drag-handle {
				display: block;
				width: 100%;
				height: 1.1rem;
				text-align: center;
				cursor: move;
				border-radius: 8px 8px 0 0;
			}

			.drag-handle:hover,
			.drag-handle.moving {
				background-color: #ccc;
			}

			.drag-handle-icon {
				display: inline-block;
				transform: rotate(90deg);
			}

		`;
		this.shadowRoot.appendChild(style);

		const body = (
			<button
				class="drag-handle"
				type="button"
				aria-label="Move dialog"
				onpointerdown={this.#onInitializeMove.bind(this)}
			>
				<span class="drag-handle-icon" aria-hidden="true">
					||
				</span>
			</button>
		);

		this.shadowRoot.appendChild(body);
		this.shadowRoot.appendChild(document.createElement("slot"));
	}

	connectedCallback() {
		const defaultX = window.innerWidth - 200 - 24;
		const defaultY = 24;
		let { x: translateX, y: translateY } = this.#getTransform();

		const host = /** @type {HTMLElement} */ (this.shadowRoot.host);
		// If the transform value isn't set or if the dialog is positioned off
		// screen due to a screen resize, reconnecting the dialog should reset it's
		// position
		if (
			host.style.transform == "" ||
			translateX + 24 > window.innerWidth ||
			translateY + 24 > window.innerHeight
		) {
			this.#setTransform(defaultX, defaultY);
		}
	}

	/** @param {PointerEvent} initialEvent */
	#onInitializeMove(initialEvent) {
		initialEvent.preventDefault();

		const dragHandle = this.shadowRoot.querySelector(".drag-handle");
		dragHandle.classList.add("moving");

		const prevCursor = document.body.style.cursor;
		document.body.style.cursor = "move";

		let prevClientX = initialEvent.clientX;
		let prevClientY = initialEvent.clientY;
		let { x: prevTranslateX, y: prevTranslateY } = this.#getTransform();

		/** @param {PointerEvent} moveEvent */
		const onMove = moveEvent => {
			moveEvent.preventDefault();

			let moveX = moveEvent.clientX - prevClientX;
			let moveY = moveEvent.clientY - prevClientY;

			let newTranslateX = prevTranslateX + moveX;
			let newTranslateY = prevTranslateY + moveY;

			if (
				// Outside bottom/right edge
				moveEvent.clientX + 24 < window.innerWidth &&
				newTranslateY + 24 < window.innerHeight &&
				// Outside top/left edge
				moveEvent.clientX - 24 > 0 &&
				newTranslateY > 0
			) {
				this.#setTransform(newTranslateX, newTranslateY);
			}

			prevClientX = moveEvent.clientX;
			prevClientY = moveEvent.clientY;
			prevTranslateX = newTranslateX;
			prevTranslateY = newTranslateY;
		};

		const onMoveEnd = () => {
			document.body.style.cursor = prevCursor;
			this.shadowRoot.querySelector(".drag-handle").classList.remove("moving");
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onMoveEnd);
		};

		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onMoveEnd);
	}

	#getTransform() {
		const host = /** @type {HTMLElement} */ (this);
		const transform = host.style.transform;

		const match = transform.match(
			/translate3d\((-?[0-9.]+)px, (-?[0-9.]+)px, 0px\)/
		);
		if (match) {
			return {
				x: parseInt(match[1], 10),
				y: parseInt(match[2], 10)
			};
		} else {
			return { x: 0, y: 0 };
		}
	}

	/** @param {number} x @param {number} y */
	#setTransform(x, y) {
		const host = /** @type {HTMLElement} */ (this);
		host.style.transform = `translate3d(${x}px, ${y}px, 0)`;
	}
}

function afterNextFrame(cb) {
	requestAnimationFrame(() => requestAnimationFrame(cb));
}

class MockFetchDebugger extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		/** @type {import('./mockFetch').Config} */
		this._config = null;

		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				display: block;
				padding: 0.125rem 0.5rem 1.1rem 0.5rem
			}

			:host([hidden]) { display: none; }

			button {
				display: inline-block;
				border: 0;
				padding: 0;
				background: none;
				font-size: inherit;
				font-family: -apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif;
			}

			label {
				display: block;
			}

			input#latency {
				display: block;
				width: 100%;
			}

			h2 {
				font-size: 20px;
				margin: 0;
				margin-top: 0.5rem;
			}

			ul {
				margin: 0;
				padding: 0;
				list-style: none;
			}

			ul:empty::after {
				content: "(Empty)";
				display: block;
			}

			#inflight .request {
				display: grid;
				margin: 0.15rem 0;
			}

			#inflight .request-btn {
				display: flex;
				grid-row: 1;
				grid-column: 1;
				padding: 0 4px;
				text-align: left;
				cursor: pointer;
			}

			#inflight .request-label {
				margin-right: auto;
			}

			#inflight .status {
				font-family: Segoe UI Symbol,-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif;
			}

			#inflight progress {
				display: block;
				height: 100%;
				width: 100%;
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				border: none;
				grid-row: 1;
				grid-column: 1;
			}

			#inflight progress::-webkit-progress-bar {
				background-color: #eee;
  			/* border-radius: 2px; */
  			/* box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset; */
			}

			#inflight progress::-webkit-progress-value {
				background-color: lightblue;
    		border-radius: 2px;
    		background-size: 35px 20px, 100% 100%, 100% 100%;
			}

			#inflight progress::-moz-progress-bar {
				background-color: lightblue;
    		border-radius: 2px;
    		background-size: 35px 20px, 100% 100%, 100% 100%;
			}

			#completed li {
				transition: opacity 3s ease-in 7s;
				opacity: 1;
			}
		`;
		this.shadowRoot.appendChild(style);

		const body = [
			<label for="latency">
				Latency: <span id="latency-label"></span>
			</label>,
			<div>
				<input
					id="latency"
					type="range"
					min="0"
					max="10000"
					step="500"
					valueAsNumber={0}
					oninput={() => this.updateLatency()}
				/>
			</div>,
			<label>
				<input
					id="pause-new"
					type="checkbox"
					oninput={event => {
						// @ts-ignore
						this.config.areNewRequestsPaused = event.target.checked;
					}}
				/>{" "}
				Pause new requests
			</label>,
			<h2>Inflight</h2>,
			<ul id="inflight"></ul>,
			<h2>Recently done</h2>,
			<ul id="completed"></ul>
		];

		body.forEach(child => this.shadowRoot.appendChild(child));
		this.update();
	}

	get config() {
		return this._config;
	}
	set config(newConfig) {
		if (this._config) {
			// Reset old config to 'auto'
			this._config.mode = "auto";
		}

		newConfig.mode = "manual";
		newConfig.on("update", () => this.update());

		// @ts-ignore
		this.shadowRoot.getElementById("latency").valueAsNumber =
			newConfig.durationMs;

		// @ts-ignore
		this.shadowRoot.getElementById("pause-new").checked =
			newConfig.areNewRequestsPaused;

		this._config = newConfig;

		requestAnimationFrame(() => {
			this.update();
			this.updateLatency();
		});
	}

	connectedCallback() {
		this.update();
	}

	disconnectedCallback() {
		this.update();
	}

	onToggleRequest(request) {
		if (request.expiresAt == null) {
			this.config.resume(request.id);
		} else {
			this.config.pause(request.id);
		}
	}

	updateLatency() {
		/** @type {HTMLInputElement} */
		// @ts-expect-error
		const latency = this.shadowRoot.getElementById("latency");
		this.config.durationMs = latency.valueAsNumber;
		const latencySec = (latency.valueAsNumber / 1000).toFixed(1);
		const latencyLabel = this.shadowRoot.getElementById("latency-label");
		const pluralEnding = latencySec == "1.0" ? "" : "s";
		latencyLabel.textContent = `${latencySec} second${pluralEnding}`;
	}

	update() {
		if (!this.isConnected || !this.config) {
			return;
		}

		const requests = this.config.requests;
		if (requests.size == 0) {
			return;
		}

		/** @type {import("./mockFetch").Request[]} */
		const finished = [];
		const now = Date.now();
		let isRunning = false; // Track if any requests are running

		// Update requests already in list
		const inflightList = this.shadowRoot.getElementById("inflight");
		for (const listItem of Array.from(inflightList.children)) {
			const requestId = listItem.getAttribute("data-req-id");
			if (requests.has(requestId)) {
				const request = requests.get(requestId);
				const isPaused = request.expiresAt == null;

				/** @type {HTMLElement} */
				const btn = listItem.querySelector(".request-btn");
				const progress = listItem.querySelector("progress");

				if (btn.getAttribute("data-paused") !== isPaused.toString()) {
					btn.setAttribute("data-paused", isPaused.toString());

					if (isPaused) {
						btn.title = "Resume request";
						btn.setAttribute("aria-label", `Resume request ${request.url}`);
						btn.querySelector(".status").textContent = "▶";
					} else {
						btn.title = "Pause request";
						btn.setAttribute("aria-label", `Pause request ${request.url}`);
						btn.querySelector(".status").textContent = "⏸";
					}
				}

				if (!isPaused) {
					isRunning = true;
					const timeLeft = request.expiresAt - now;
					if (timeLeft < 16) {
						// If this request will expire within 16 ms of now (or has already
						// expired) then go ahead and mark it as finished
						finished.push(request);
					} else {
						progress.value =
							((request.duration - timeLeft) / request.duration) * 100;
					}
				}
			} else {
				// Huh... shouldn't happen but let's go ahead and clean up the UI
				listItem.remove();
			}
		}

		// Add new requests
		for (const request of requests.values()) {
			const isPaused = request.expiresAt == null;
			let existingItem = this.shadowRoot.querySelector(
				`[data-req-id="${request.id}"]`
			);

			if (!existingItem) {
				if (!isPaused) {
					isRunning = true;
				}

				inflightList.appendChild(
					<li class="request" data-req-id={request.id}>
						<progress value={0} max={100}></progress>
						<button
							class="request-btn"
							data-paused={isPaused.toString()}
							title={isPaused ? "Resume request" : "Pause request"}
							aria-label={
								isPaused
									? `Resume request ${request.url}`
									: `Pause request ${request.url}`
							}
							type="button"
							onclick={() => this.onToggleRequest(request)}
						>
							<span class="request-label">{request.url}</span>
							<span class="status">{isPaused ? "▶" : "⏸"}</span>
						</button>
					</li>
				);
			}
		}

		// Move finished requests
		/** @type {JSX.Element[]} */
		const finishedItems = [];
		const completedList = this.shadowRoot.getElementById("completed");
		for (let request of finished) {
			this.shadowRoot.querySelector(`[data-req-id="${request.id}"]`).remove();
			request.resolve();
			requests.delete(request.id);

			const newItem = (
				// @ts-expect-error
				<li ontransitionend={event => event.target.remove()}>{request.url}</li>
			);

			finishedItems.push(newItem);
			completedList.appendChild(newItem);
		}

		if (finishedItems.length) {
			// Firefox requires at least one frame of 100% opacity before it will
			// trigger the transition to 0 opacity
			afterNextFrame(() =>
				finishedItems.forEach(li => (li.style.opacity = "0"))
			);
		}

		if (isRunning) {
			requestAnimationFrame(() => this.update());
		}
	}
}

export function installFetchDebugger() {
	window.customElements.define("draggable-dialog", DraggableDialog);
	window.customElements.define("mock-fetch-debugger", MockFetchDebugger);
}
