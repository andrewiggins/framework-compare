/// <reference path="jsx.d.ts" />

import cc from "classcat";

const hasOwn = Object.prototype.hasOwnProperty;

/** @jsx h */

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

const translateRe = /translate3d\((-?[0-9]+)px, (-?[0-9]+)px, 0px\)/;

/**
 * @param {number} x
 * @param {number} y
 */
function getRootTransform(x, y) {
	return `translate3d(${x}px, ${y}px, 0)`;
}

function getInitialRootTransform() {
	const x = window.innerWidth - 200 - 24;
	const y = 24;
	return getRootTransform(x, y);
}

class MockFetchDebugger extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });

		/** @type {import('./mockFetch').Config} */
		this._config = null;
		this._show = false;

		const style = document.createElement("style");
		style.innerHTML = `
			#root {
				display: none;
				padding: 1.1rem 0.5rem;
				border: 1px solid black;
				border-radius: 8px;
				background-color: white;
			}

			#root.show {
				display: block;
			}

			#root.dialog {
				position: fixed;
				top: 0;
				left: 0;
				z-index: 1;
				/* https://getcssscan.com/css-box-shadow-examples */
				box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
			}

			button {
				display: inline-block;
				border: 0;
				padding: 0;
				background: none;
				font-size: inherit;
				font-family: -apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif;
			}

			.drag-handle {
				display: none;
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				width: 100%;
				height: 1.1rem;
				text-align: center;
				cursor: move;
				border-radius: 8px 8px 0 0;
			}

			.dialog .drag-handle {
				display: block;
			}

			.drag-handle:hover,
			.drag-handle.moving {
				background-color: #ccc;
			}

			.drag-handle-icon {
				display: inline-block;
				transform: rotate(90deg);
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
				position: relative;
				margin: 0.15rem 0;
			}

			#inflight .request-btn {
				display: flex;
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
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
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				border: none;
				width: calc(100% - 1em);
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

		const body = (
			<div
				id="root"
				class={cc({
					show: this.hasAttribute("show"),
					dialog: this.hasAttribute("dialog")
				})}
			>
				<button
					class="drag-handle"
					type="button"
					aria-label="Move fetch debugger"
					onpointerdown={this.onInitializeMove.bind(this)}
				>
					<span class="drag-handle-icon" aria-hidden="true">
						||
					</span>
				</button>
				<label for="latency">
					Latency: <span id="latency-label"></span>
				</label>
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
				</div>
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
				</label>
				<h2>Inflight</h2>
				<ul id="inflight"></ul>
				<h2>Recently done</h2>
				<ul id="completed"></ul>
			</div>
		);

		this.shadowRoot.appendChild(body);
		this.update();
	}

	get config() {
		return this._config;
	}
	set config(newConfig) {
		if (newConfig !== this._config) {
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
	}

	get show() {
		return this.hasAttribute("show");
	}
	set show(newShow) {
		if (newShow) {
			this.setAttribute("show", "");
		} else {
			this.removeAttribute("show");
		}
	}

	get dialog() {
		return this.hasAttribute("dialog");
	}
	set dialog(newDialog) {
		if (newDialog) {
			this.setAttribute("dialog", "");
		} else {
			this.removeAttribute("dialog");
		}
	}

	connectedCallback() {
		this.update();
	}

	disconnectedCallback() {
		this.update();
	}

	static get observedAttributes() {
		return ["show", "dialog"];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		const root = this.shadowRoot.getElementById("root");

		if (name == "show") {
			if (newValue == null) {
				root.classList.remove("show");
			} else {
				root.classList.add("show");
			}
		}

		if (name == "dialog") {
			let match;
			if (root.style.transform == "") {
				root.style.transform = getInitialRootTransform();
			} else if ((match = root.style.transform.match(translateRe))) {
				let translateX = parseInt(match[1], 10);
				let translateY = parseInt(match[2], 10);

				if (
					translateX + 24 > window.innerWidth ||
					translateY + 24 > window.innerHeight
				) {
					// If dialog is positioned off screen due to a screen resize, toggling
					// the dialog should reset it's position
					root.style.transform = getInitialRootTransform();
				}
			}

			if (newValue == null) {
				root.classList.remove("dialog");
			} else {
				root.classList.add("dialog");
			}
		}

		if (name == "show") {
			this.update();
		}
	}

	/** @param {PointerEvent} initialEvent */
	onInitializeMove(initialEvent) {
		initialEvent.preventDefault();
		const root = this.shadowRoot.getElementById("root");
		root.querySelector(".drag-handle").classList.add("moving");
		let prevClientX = initialEvent.clientX;
		let prevClientY = initialEvent.clientY;
		let prevTranslateX = 0;
		let prevTranslateY = 0;

		let match = root.style.transform.match(translateRe);
		if (match) {
			prevTranslateX = parseInt(match[1], 10);
			prevTranslateY = parseInt(match[2], 10);
		}

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
				root.style.transform = getRootTransform(newTranslateX, newTranslateY);
			}

			prevClientX = moveEvent.clientX;
			prevClientY = moveEvent.clientY;
			prevTranslateX = newTranslateX;
			prevTranslateY = newTranslateY;
		};

		const onMoveEnd = () => {
			root.querySelector(".drag-handle").classList.remove("moving");
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onMoveEnd);
		};

		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onMoveEnd);
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
		if (!this.isConnected || this.show == false || !this.config) {
			// Should I check for display: none?
			return;
		}

		const requests = this.config.requests;
		if (requests.size == 0) {
			return;
		}

		/** @type {import("./mockFetch").Request[]} */
		const finished = [];
		const now = Date.now();

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
				inflightList.appendChild(
					<li class="request" data-req-id={request.id}>
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
						<progress value={0} max={100}></progress>
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

		requestAnimationFrame(() => {
			finishedItems.forEach(li => (li.style.opacity = "0"));
			this.update();
		});
	}
}

export function installFetchDebugger() {
	window.customElements.define("mock-fetch-debugger", MockFetchDebugger);
}
