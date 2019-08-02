import Prism from "prismjs";

/**
 * @param {any} arg
 * @returns {any[]}
 */
const toArray = arg => Array.prototype.slice.call(arg);

export function initBundleToggle() {
	/** @type {HTMLInputElement} */
	const toggle = document.getElementById("bundle-toggle");
	const bundle = document.getElementById("bundles");

	console.log(toggle, bundle, toggle && toggle.checked);
	if (toggle && bundle) {
		if (toggle.checked) {
			loadBundles();
		} else {
			toggle.addEventListener("change", e => {
				if (e.target.checked) {
					loadBundles();
				}
			});
		}
	}
}

const langRegex = /\blang(?:uage)?-([\w-]+)\b/i;

function loadBundles() {
	// Inspired by prism-file-highlight

	/** @type {HTMLPreElement[]} */
	const preTags = toArray(document.querySelectorAll("#bundles pre[data-src]"));
	for (let pre of preTags) {
		if (pre.hasAttribute("data-src-loaded")) {
			continue;
		}

		const code = pre.querySelector("code");
		const src = pre.getAttribute("data-src");
		const lang = (pre.className.match(langRegex) || [, ""])[1];
		fetch(src)
			.then(res => {
				if (!res.ok) {
					throw new Error(
						`✖ Error ${res.status} while fetching file: ${res.statusText}`
					);
				} else {
					return res.text();
				}
			})
			.then(text => {
				code.innerHTML = Prism.highlight(text, Prism.languages[lang], lang);
			});
	}
}
