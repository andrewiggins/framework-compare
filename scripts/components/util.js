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
	const app1Name = typeof app1 == "string" ? app1 : app1.appName;
	const app2Name = typeof app2 == "string" ? app2 : app2.appName;

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

const toTitleCase = str => {
	return str.replace(/\w\S*/g, txt => {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
};

/** @type {(app: string) => string} */
const getDisplayName = app => toTitleCase(app.replace(/-/g, " "));

const frameworkRegex = /\/frameworks\/([A-Za-z0-9_\-]+)\//i;

/**
 * @param {string} url
 */
export function getFramework(url) {
	const match = url.match(frameworkRegex);
	return match && getDisplayName(match[1]);
}
