// Inspired by https://github.com/rstacruz/details-polyfill/

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
 * @param {Event} e
 */
function clickHandler(e) {
	/** @type {HTMLElement} */
	let target = e.target;
	while (target && target.nodeName.toLowerCase() !== "summary") {
		target = target.parentNode;
	}

	if (target && target.nodeName.toLowerCase() === "summary") {
		/** @type {HTMLDetailsElement} */
		const details = target.parentNode;
		if (!details) return;

		if (details.getAttribute("open")) {
			details.open = false;
			details.removeAttribute("open");
		} else {
			details.open = true;
			details.setAttribute("open", "open");
		}
	}
}

export function installPolyfill() {
	if (isSupported()) {
		return;
	}

	document.documentElement.className += " no-details";

	window.addEventListener("click", clickHandler);

	injectStyle(
		"details-polyfill-style",
		[
			"html.no-details details:not([open]) > :not(summary) { display: none; }"
			// 'html.no-details details > summary:before { content: "\u25b6"; display: inline-block; font-size: .8em; width: 1.5em; }',
			// 'html.no-details details[open] > summary:before { content: "\u25bc"; }'
		].join("\n")
	);
}
