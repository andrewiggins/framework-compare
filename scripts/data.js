const path = require("path");
const { readFile, readdir } = require("fs").promises;
const getGzipSize = require("gzip-size");
const getBrotliSize = require("brotli-size");
const {
	capitalize,
	outputPath,
	toUrl,
	getFrameworkPath,
	frameworkOutput
} = require("./util");

const replaceExt = (fileName, newExt) => {
	let newFilename = path.basename(fileName, path.extname(fileName)) + newExt;
	return path.join(path.dirname(fileName), newFilename);
};

/** @type {(app: string) => string} */
const getAppName = app =>
	app[0].toUpperCase() + app.slice(1).replace(/([A-Z])/g, " $1");

/**
 * @typedef {{ framework: string; name: string; htmlUrl: string; jsUrl: string; gzipSize: number; brotliSize: number; }} AppData
 * @typedef {Array<{ name: string; apps: AppData[] }>} FrameworkData
 * @returns {Promise<FrameworkData>}
 */
async function buildFrameworkData() {
	const frameworks = await readdir(frameworkOutput());
	return await Promise.all(
		frameworks.map(async framework => {
			const distFiles = await readdir(frameworkOutput(framework));
			const jsFiles = distFiles.filter(file => path.extname(file) === ".js");
			const appNames = jsFiles.map(jsFile => replaceExt(jsFile, ""));

			const apps = await Promise.all(
				appNames.map(async (appName, i) => {
					const htmlFile = replaceExt(appName, ".html");
					const htmlPath = getFrameworkPath(framework, htmlFile);
					const jsPath = getFrameworkPath(framework, jsFiles[i]);
					const jsContents = await readFile(outputPath(jsPath));

					const [gzipSize, brotliSize] = await Promise.all([
						getGzipSize(jsContents),
						getBrotliSize(jsContents)
					]);

					return {
						framework: capitalize(framework),
						name: getAppName(appName),
						htmlUrl: toUrl(htmlPath),
						jsUrl: toUrl(jsPath),
						gzipSize,
						brotliSize
					};
				})
			);

			return { name: capitalize(framework), apps };
		})
	);
}

module.exports = {
	buildFrameworkData
};
