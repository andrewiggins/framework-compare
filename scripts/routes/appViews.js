import path from "path";
import { writeFile } from "fs/promises";
import { h } from "preact";
import { ensureDir, getDisplayName, outputPath } from "../util.js";

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["AppPage"]} AppPage
 * @param {import('../data').FrameworkData} frameworkData
 */
export async function buildAppViews(renderPage, AppPage, frameworkData) {
	/** @type {Array<import('../data').AppData>} */
	const allApps = frameworkData.reduce(
		(apps, framework) => apps.concat(framework.apps),
		[]
	);

	await Promise.all(
		allApps.map(async app => {
			const title = `${getDisplayName(app.appId)} - ${getDisplayName(
				app.frameworkId
			)}`;
			const page = h(AppPage, { app, currentUrl: app.htmlUrl });
			const appHtml = renderPage(page, {
				url: app.htmlUrl,
				title,
				bodyClass: "app-page",
				scripts: [app.jsUrl]
			});

			const htmlPath = outputPath(app.htmlUrl);
			await ensureDir(path.dirname(htmlPath));
			await writeFile(htmlPath, appHtml, "utf8");
		})
	);
}
