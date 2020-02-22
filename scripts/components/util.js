const path = require("path");

const sorted = [
	"Hello World",
	"7GUIs Counter",
	"7GUIs Temp Converter",
	"7GUIs Flight Booker",
	"7GUIs Timer",
	"7GUIs CRUD"
];

/**
 * @param {import('../data').AppData | string} app1
 * @param {import('../data').AppData | string} app2
 */
export function appSorter(app1, app2) {
	const app1Name = typeof app1 == "string" ? app1 : getDisplayName(app1.appId);
	const app2Name = typeof app2 == "string" ? app2 : getDisplayName(app2.appId);

	if (!sorted.includes(app1Name)) {
		return 1;
	}

	if (!sorted.includes(app2Name)) {
		return -1;
	}

	return sorted.indexOf(app1Name) - sorted.indexOf(app2Name);
}

/**
 * @typedef {Array<{ id: string; frameworks: Array<import('../data').AppData>; }>} ByAppData
 * @param {import('../data').FrameworkData} frameworkData
 * @returns {ByAppData}
 */
export function groupByApp(frameworkData) {
	/** @type {ByAppData} */
	const apps = [];

	/** @type {Record<string, number>} */
	const appIndexes = {};

	for (let framework of frameworkData) {
		for (let app of framework.apps) {
			if (!(app.appId in appIndexes)) {
				appIndexes[app.appId] = apps.length;
				apps.push({ id: app.appId, frameworks: [] })
			}

			const index = appIndexes[app.appId];
			apps[index].frameworks.push(app);
		}
	}

	return apps;
}

export function relativeUrl(currentUrl, url) {
	return path.relative(path.dirname(currentUrl), url).replace(/\\/g, "/");
}

const toTitleCase = str => {
	return str.replace(/\w\S*/g, txt => {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
};

/** @type {(id: string) => string} */
export const getDisplayName = id => {
	if (id == "lit-html") {
		return "lit-html";
	}

	return toTitleCase(id.replace(/-/g, " "));
}
