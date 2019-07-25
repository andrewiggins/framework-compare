const { writeFile } = require("fs").promises;
const path = require("path");
const { h } = require("preact");
const { toUrl, outputPath, ensureDir } = require("../util");

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["AppPage"]} AppPage
 * @param {import('../data').FrameworkData} frameworkData
 */
async function buildAppViews(renderPage, AppPage, frameworkData) {
	/** @type {Array<import('../data').AppData>} */
	const allApps = frameworkData.reduce(
		(apps, framework) => apps.concat(framework.apps),
		[]
	);

	await Promise.all(
		allApps.map(async app => {
			const title = `${app.appName} - ${app.framework}`;
			const page = h(AppPage, { app });
			const appHtml = renderPage(page, {
				url: app.htmlUrl,
				title,
				bodyClass: "app-page",
				scripts: [app.jsUrl]
			});

			const htmlPath = app.htmlUrl;
			await ensureDir(path.dirname(htmlPath));
			await writeFile(htmlPath, appHtml, "utf8");
		})
	);
}

module.exports = {
	buildAppViews
};
