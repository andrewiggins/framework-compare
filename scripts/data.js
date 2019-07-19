const path = require("path");
const { readFile } = require("fs").promises;
const getGzipSize = require("gzip-size");
const getBrotliSize = require("brotli-size");
const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");
const {
	getDisplayName,
	toUrl,
	frameworkOutput,
	listDirs,
	listFiles,
	srcPath
} = require("./util");

loadLanguages(["jsx"]);

const replaceExt = (fileName, newExt) => {
	let newFilename = path.basename(fileName, path.extname(fileName)) + newExt;
	return path.join(path.dirname(fileName), newFilename);
};

/**
 * @typedef {Array<{ name: string; apps: AppData[] }>} FrameworkData
 * @returns {Promise<FrameworkData>}
 */
async function buildFrameworkData() {
	const frameworks = await listDirs(frameworkOutput());
	return await Promise.all(
		frameworks.map(async framework => {
			const distFiles = await listFiles(frameworkOutput(framework));
			const jsFiles = distFiles.filter(file => file.endsWith(".min.js"));
			const appNames = jsFiles.map(jsFile => jsFile.replace(".min.js", ""));

			const apps = await Promise.all(
				appNames.map(async (appName, i) =>
					buildAppData(framework, appName, jsFiles[i])
				)
			);

			return { name: getDisplayName(framework), apps };
		})
	);
}

/**
 * @typedef SourceFile
 * @property {string} lang
 * @property {string} contents
 * @property {string} htmlContents
 *
 * @typedef AppData
 * @property {string} framework
 * @property {string} name
 * @property {string} htmlUrl
 * @property {string} jsUrl
 * @property {number} gzipSize
 * @property {number} brotliSize
 * @property {Record<string, SourceFile>} sources
 *
 * @param {string} framework
 * @param {string} appName
 * @param {string} jsFile
 * @returns {Promise<AppData>}
 */
async function buildAppData(framework, appName, jsFile) {
	const htmlFile = replaceExt(appName, ".html");
	const htmlPath = frameworkOutput(framework, htmlFile);
	const jsPath = frameworkOutput(framework, jsFile);
	const srcFiles = await listFiles(srcPath(framework, appName));

	const [jsContents, ...srcContents] = await Promise.all([
		readFile(jsPath, "utf8"),
		...srcFiles.map(file => readFile(srcPath(framework, appName, file), "utf8"))
	]);

	const [gzipSize, brotliSize] = await Promise.all([
		getGzipSize(jsContents),
		getBrotliSize(jsContents)
	]);

	/** @type {Record<string, SourceFile>} */
	const sources = {};
	for (let i = 0; i < srcFiles.length; i++) {
		const contents = srcContents[i].trim();
		const ext = srcFiles[i].split(".").pop();
		const lang = ext === "vue" ? "html" : ext;
		sources[srcFiles[i]] = {
			lang,
			contents,
			htmlContents: Prism.highlight(contents, Prism.languages[lang], lang)
		};
	}

	return {
		framework: getDisplayName(framework),
		name: getDisplayName(appName),
		htmlUrl: toUrl(htmlPath),
		jsUrl: toUrl(jsPath),
		gzipSize,
		brotliSize,
		sources
	};
}

module.exports = {
	buildFrameworkData
};
