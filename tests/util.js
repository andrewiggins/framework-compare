import path from "path";
import { JSDOM } from "jsdom";

const { document } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window;

export function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {string} [sel]
 */
export const appSel = sel => (sel ? `#app ${sel}` : "#app");

export async function getAppHtml() {
	const html = await page.$eval(appSel(), el => el.innerHTML);
	return html.replace(/ value="[0-9a-zA-z_\-\.]*"/g, "");
}

export function repoRoot(...args) {
	return path.join(__dirname, "..", ...args);
}

export async function backspaceInput(selector) {
	const charCount = await page.$eval(selector, el => el.value.length);
	await page.click(selector);

	for (let i = 0; i < charCount; i++) {
		await page.keyboard.press("Backspace");
	}
}

/**
 * @param {keyof HTMLElementTagNameMap} tagName
 * @param {Record<string, any>} [attrs]
 * @param {string[]} [children]
 */
export function toHtmlString(tagName, attrs, ...children) {
	if (tagName === toHtmlString.Fragment) {
		return children.join("");
	}

	const element = document.createElement(tagName);

	if (attrs) {
		for (let attrName of Object.keys(attrs)) {
			element.setAttribute(attrName, attrs[attrName]);
		}
	}

	element.innerHTML = children.join("");

	return element.outerHTML;
}

toHtmlString.Fragment = {};
