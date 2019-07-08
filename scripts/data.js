const path = require("path");
const { readFile } = require("fs").promises;
const getGzipSize = require("gzip-size");
const getBrotliSize = require("brotli-size");
const {
	toTitleCase,
	outputPath,
	toUrl,
	frameworkOutput,
	listDirs,
	listFiles
} = require("./util");

const replaceExt = (fileName, newExt) => {
	let newFilename = path.basename(fileName, path.extname(fileName)) + newExt;
	return path.join(path.dirname(fileName), newFilename);
};

/** @type {(app: string) => string} */
const getDisplayName = app => toTitleCase(app.replace(/-/g, " "));

/**
 * @typedef {{ framework: string; name: string; htmlUrl: string; jsUrl: string; gzipSize: number; brotliSize: number; }} AppData
 * @typedef {Array<{ name: string; apps: AppData[] }>} FrameworkData
 * @returns {Promise<FrameworkData>}
 */
async function buildFrameworkData() {
	const frameworks = await listDirs(frameworkOutput());
	return await Promise.all(
		frameworks.map(async framework => {
			const distFiles = await listFiles(frameworkOutput(framework));
			const jsFiles = distFiles.filter(file => path.extname(file) === ".js");
			const appNames = jsFiles.map(jsFile => replaceExt(jsFile, ""));

			const apps = await Promise.all(
				appNames.map(async (appName, i) => {
					const htmlFile = replaceExt(appName, ".html");
					const htmlPath = frameworkOutput(framework, htmlFile);
					const jsPath = frameworkOutput(framework, jsFiles[i]);
					const jsContents = await readFile(jsPath);

					const [gzipSize, brotliSize] = await Promise.all([
						getGzipSize(jsContents),
						getBrotliSize(jsContents)
					]);

					return {
						framework: getDisplayName(framework),
						name: getDisplayName(appName),
						htmlUrl: toUrl(htmlPath),
						jsUrl: toUrl(jsPath),
						gzipSize,
						brotliSize
					};
				})
			);

			return { name: getDisplayName(framework), apps };
		})
	);
}

module.exports = {
	buildFrameworkData
};
