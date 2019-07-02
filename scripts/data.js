const path = require("path");
const { readFile, readdir } = require("fs").promises;
const gzipSize = require("gzip-size");
const { p, toUrl } = require("./util");

const replaceExt = (fileName, newExt) => {
	let newFilename = path.basename(fileName, path.extname(fileName)) + newExt;
	return path.join(path.dirname(fileName), newFilename);
};

/** @type {(app: string) => string} */
const getAppName = app =>
	app[0].toUpperCase() + app.slice(1).replace(/([A-Z])/g, " $1");
const getFrameworkPath = framework => `frameworks/${framework}/dist`;
const getAppHtmlPath = (fpath, app) =>
	path.join(fpath, replaceExt(app, ".html"));
const getAppJsPath = (fpath, app) => path.join(fpath, app);

/**
 * @typedef {{ framework: string; name: string; htmlUrl: string; jsUrl: string; gzipSize: number; }} AppData
 * @typedef {Array<{ name: string; apps: AppData[] }>} FrameworkData
 * @returns {Promise<FrameworkData>}
 */
async function buildFrameworkData() {
	const frameworks = await readdir(p("frameworks"));
	return await Promise.all(
		frameworks.map(async framework => {
			const frameworkPath = getFrameworkPath(framework);
			const distFiles = await readdir(p(frameworkPath));
			const jsFiles = distFiles.filter(file => path.extname(file) === ".js");
			const appNames = jsFiles.map(jsFile => replaceExt(jsFile, ""));

			const name = framework;
			const apps = await Promise.all(
				appNames.map(async (appName, i) => {
					const htmlPath = getAppHtmlPath(frameworkPath, appName);
					const jsPath = getAppJsPath(frameworkPath, jsFiles[i]);
					const jsContents = await readFile(p(jsPath));

					return {
						framework: name,
						name: getAppName(appName),
						htmlUrl: toUrl(htmlPath),
						jsUrl: toUrl(jsPath),
						gzipSize: await gzipSize(jsContents)
					};
				})
			);

			return { name, apps };
		})
	);
}

module.exports = {
	buildFrameworkData
};
