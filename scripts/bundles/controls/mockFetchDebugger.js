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

class MockFetchControl extends HTMLElement {
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
				padding: 1rem 0.5rem;
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

			.drag-handle:hover {
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
		`;
		this.shadowRoot.appendChild(style);

		const body = (
			<div id="root">
				<button
					class="drag-handle"
					aria-label="Move fetch debugger"
					onmousedown={this.onInitializeMove.bind(this)}
				>
					<span class="drag-handle-icon" aria-hidden="true">
						||
					</span>
				</button>
				<label for="latency">
					Latency: <span id="latency-label"></span>
				</label>
				<input
					id="latency"
					type="range"
					min="0"
					max="10000"
					step="500"
					oninput={this.onLatencyInput.bind(this)}
				/>
				<label>
					<input
						id="pause-new"
						type="checkbox"
						oninput={this.onPauseNew.bind(this)}
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

			newConfig.mode = "interactive";
			newConfig.on("update", () => this.update());
			this._config = newConfig;
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
				let translateX = match[1];
				let translateY = match[2];

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

	/** @param {MouseEvent} initialEvent */
	onInitializeMove(initialEvent) {
		initialEvent.preventDefault();
		const root = this.shadowRoot.getElementById("root");
		let prevClientX = initialEvent.clientX;
		let prevClientY = initialEvent.clientY;
		let prevTranslateX = 0;
		let prevTranslateY = 0;

		let match = root.style.transform.match(translateRe);
		if (match) {
			prevTranslateX = parseInt(match[1], 10);
			prevTranslateY = parseInt(match[2], 10);
		}

		/** @param {MouseEvent} moveEvent */
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
			document.removeEventListener("mousemove", onMove);
			document.removeEventListener("mouseup", onMoveEnd);
		};

		document.addEventListener("mousemove", onMove);
		document.addEventListener("mouseup", onMoveEnd);
	}

	/** @param {InputEvent} event */
	onLatencyInput(event) {
		this.config.durationMs = event.target.valueAsNumber;
		this.update();
	}

	/** @param {Event} event */
	onPauseNew(event) {
		this.config.areNewRequestsPaused = event.target.checked;
	}

	update() {
		if (!this.isConnected || this.show == false) {
			// Should I check for display: none?
			return;
		}

		const latency = this.shadowRoot.getElementById("latency");
		latency.valueAsNumber = this.config.durationMs;

		const latencySec = (latency.valueAsNumber / 1000).toFixed(1);
		const latencyLabel = this.shadowRoot.getElementById("latency-label");
		latencyLabel.textContent = `${latencySec} second${
			latencySec == "1.0" ? "" : "s"
		}`;
	}
}

export function installFetchDebugger() {
	window.customElements.define("mock-fetch-debugger", MockFetchControl);
}
