// Inspired by https://github.com/rstacruz/details-polyfill/

/** @type {(arg: any) => any[]} */
const toArray = arrayLike => Array.prototype.slice.call(arrayLike);

function isSupported() {
	var el = document.createElement("details");
	if (!("open" in el)) return false;

	const result = true;
	// el.innerHTML = "<summary>a</summary>b";
	// document.body.appendChild(el);

	// var diff = el.offsetHeight;
	// el.open = true;
	// var result = diff != el.offsetHeight;

	// document.body.removeChild(el);
	return result;
}

function injectStyle(id, style) {
	if (document.getElementById(id)) return;

	var el = document.createElement("style");
	el.id = id;
	el.innerHTML = style;

	document.getElementsByTagName("head")[0].appendChild(el);
}

/**
 * @param {Node} target
 * @param {string} parentType
 */
function getParentNode(target, parentType) {
	while (target && target.nodeName.toLowerCase() !== parentType) {
		target = target.parentNode;
	}

	return target && target.nodeName.toLowerCase() === parentType ? target : null;
}

function toggleDetails(summary) {
	if (summary) {
		/** @type {HTMLDetailsElement} */
		const details = summary.parentNode;
		if (!details) return;

		if (details.hasAttribute("open")) {
			details.open = false;
			details.removeAttribute("open");
			summary.setAttribute("aria-expanded", "false");
		} else {
			details.open = true;
			details.setAttribute("open", "open");
			summary.setAttribute("aria-expanded", "true");
		}
	}
}

/**
 * @param {Event} e
 */
function clickHandler(e) {
	e.preventDefault();
	const summary = getParentNode(e.target, "summary");
	toggleDetails(summary);
}

/**
 * @param {KeyboardEvent} e
 */
function keydownHandler(e) {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		const summary = getParentNode(e.target, "summary");
		toggleDetails(summary);
	}
}

export function installPolyfill() {
	if (isSupported()) {
		return;
	}

	document.documentElement.className += " no-details";

	/** @type {HTMLDetailsElement[]} */
	const details = toArray(document.querySelectorAll("details"));
	for (let detail of details) {
		let summary = null;
		for (let child of detail.children) {
			if (child.tagName.toLowerCase() === "summary") {
				summary = child;
				break;
			}
		}

		summary.setAttribute("role", "button");
		summary.setAttribute("tabindex", "0");
		if (detail.hasAttribute("open")) {
			summary.setAttribute("aria-expanded", "true");
		} else {
			summary.setAttribute("aria-expanded", "false");
		}

		summary.addEventListener("click", clickHandler);
		summary.addEventListener("keydown", keydownHandler);
	}

	injectStyle(
		"details-polyfill-style",
		[
			"html.no-details details:not([open]) > :not(summary) { display: none; }"
			// 'html.no-details details > summary:before { content: "\u25b6"; display: inline-block; font-size: .8em; width: 1.5em; }',
			// 'html.no-details details[open] > summary:before { content: "\u25bc"; }'
		].join("\n")
	);
}
