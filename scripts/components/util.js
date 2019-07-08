const path = require("path");

const sorted = [
	"Hello World",
	"7GUIs Counter",
	"7GUIs Temp Converter",
	"7GUIs Flight Booker"
];

/**
 * @param {import('../data').AppData | string} app1
 * @param {import('../data').AppData | string} app2
 */
export function appSorter(app1, app2) {
	const app1Name = typeof app1 == "string" ? app1 : app1.name;
	const app2Name = typeof app2 == "string" ? app2 : app2.name;

	if (!sorted.includes(app1Name)) {
		return 1;
	}

	if (!sorted.includes(app2Name)) {
		return -1;
	}

	return sorted.indexOf(app1Name) - sorted.indexOf(app2Name);
}

export function relativeUrl(currentUrl, url) {
	return path.relative(path.dirname(currentUrl), url).replace(/\\/g, "/");
}
