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

/**
 * @typedef {Array<{ name: string; apps: AppData[] }>} FrameworkData
 * @returns {Promise<FrameworkData>}
 */
async function buildFrameworkData() {
	const frameworks = await listDirs(frameworkOutput());
	return await Promise.all(
		frameworks.map(async framework => {
			const appFolders = await listDirs(frameworkOutput(framework));
			const apps = await Promise.all(
				appFolders.map(async (appName, i) => buildAppData(framework, appName))
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
 * @typedef BundleFile
 * @property {string} lang
 * @property {number} contentLength
 * @property {string} url
 *
 * @typedef AppData
 * @property {string} framework
 * @property {string} appName
 * @property {string} htmlUrl
 * @property {string} jsUrl
 * @property {{ minified: number; gzip: number; brotli: number; }} sizes
 * @property {Record<string, SourceFile>} sources
 * @property {Record<string, BundleFile>} bundles
 *
 * @param {string} framework
 * @param {string} appName
 * @returns {Promise<AppData>}
 */
async function buildAppData(framework, appName) {
	const appOutput = (...args) => frameworkOutput(framework, appName, ...args);

	const htmlPath = appOutput("index.html");
	const jsPath = appOutput("index.min.js");
	const [appFiles, srcFiles] = await Promise.all([
		listFiles(appOutput()),
		listFiles(srcPath(framework, appName))
	]);

	const bundleFiles = appFiles.filter(
		file => file.endsWith(".js") && !file.endsWith(".min.js")
	);

	const [jsContents, ...otherContents] = await Promise.all([
		readFile(jsPath, "utf8"),
		...srcFiles.map(file =>
			readFile(srcPath(framework, appName, file), "utf8")
		),
		...bundleFiles.map(file => readFile(appOutput(file), "utf8"))
	]);

	const [gzipSize, brotliSize] = await Promise.all([
		getGzipSize(jsContents),
		getBrotliSize(jsContents)
	]);

	const srcContents = otherContents.slice(0, srcFiles.length);
	const bundleContents = otherContents.slice(srcFiles.length);

	if (srcContents.length !== srcFiles.length) {
		throw new Error(
			`srcContents.length (${
				srcContents.length
			}) does not match srcFiles.length ${srcFiles.length} `
		);
	}

	if (bundleContents.length !== bundleFiles.length) {
		throw new Error(
			`bundleContents.length (${
				bundleContents.length
			}) does not match bundleFiles.length ${bundleFiles.length} `
		);
	}

	/** @type {Record<string, SourceFile>} */
	const sources = {};
	for (let i = 0; i < srcFiles.length; i++) {
		const contents = srcContents[i].trim();
		const ext = srcFiles[i].split(".").pop();
		const lang = getLang(ext);
		sources[srcFiles[i]] = {
			lang,
			contents,
			htmlContents: Prism.highlight(contents, Prism.languages[lang], lang)
		};
	}

	/** @type {Record<string, BundleFile>} */
	const bundles = {};
	for (let i = 0; i < bundleFiles.length; i++) {
		const contents = bundleContents[i].trim();
		const ext = bundleFiles[i].split(".").pop();
		const lang = getLang(ext);

		bundles[bundleFiles[i]] = {
			lang,
			url: toUrl(appOutput(bundleFiles[i])),
			contentLength: contents.length
		};
	}

	return {
		framework: getDisplayName(framework),
		appName: getDisplayName(appName),
		htmlUrl: toUrl(htmlPath),
		jsUrl: toUrl(jsPath),
		sizes: {
			minified: jsContents.length,
			gzip: gzipSize,
			brotli: brotliSize
		},
		sources,
		bundles
	};
}

const getLang = ext => (ext === "vue" ? "html" : ext);

module.exports = {
	buildFrameworkData
};
