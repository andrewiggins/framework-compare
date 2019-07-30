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

const getLang = ext => (ext === "vue" ? "html" : ext);

/**
 * @typedef SourceFile
 * @property {string} name
 * @property {string} lang
 * @property {string} contents
 * @property {string} htmlContents
 *
 * @param {string} framework
 * @param {string} appName
 *
 * @returns {Promise<Record<string, SourceFile>>}
 */
async function getSourceFiles(framework, appName) {
	let srcFiles = await listFiles(srcPath(framework, appName));

	const srcContents = await Promise.all(
		srcFiles.map(file => readFile(srcPath(framework, appName, file), "utf8"))
	);

	/** @type {Record<string, SourceFile>} */
	const sources = {};
	for (let i = 0; i < srcFiles.length; i++) {
		const srcFile = srcFiles[i];
		const contents = srcContents[i];

		const ext = srcFile.split(".").pop();
		const lang = getLang(ext);

		sources[srcFile] = {
			name: srcFile,
			lang,
			contents,
			htmlContents: Prism.highlight(contents, Prism.languages[lang], lang)
		};
	}

	return sources;
}

/**
 * @typedef Sizes
 * @property {number} minified
 * @property {number} gzip
 * @property {number} brotli
 *
 * @typedef BundleFile
 * @property {string} name
 * @property {string} lang
 * @property {number} contentLength
 * @property {string} url
 * @property {Sizes} [sizes]
 *
 * @param {string} framework
 * @param {string} appName
 *
 * @returns {Promise<Record<string, BundleFile>>}
 */
async function getBundleFiles(framework, appName) {
	const appOutput = (...args) => frameworkOutput(framework, appName, ...args);
	const bundleFiles = (await listFiles(appOutput())).filter(file =>
		file.endsWith(".js")
	);

	const bundleContents = await Promise.all(
		bundleFiles.map(file => readFile(appOutput(file), "utf8"))
	);

	/** @type {Record<string, BundleFile>} */
	const bundles = {};
	for (let i = 0; i < bundleFiles.length; i++) {
		const bundleFile = bundleFiles[i];
		const contents = bundleContents[i].trim();

		const name = bundleFile.replace(".min", "");
		const ext = bundleFile.split(".").pop();
		const lang = getLang(ext);

		if (!(name in bundles)) {
			bundles[name] = { name, lang, contentLength: 0, url: "" };
		}

		if (bundleFile.endsWith(".min.js")) {
			bundles[name].sizes = {
				minified: contents.length,
				gzip: await getGzipSize(contents),
				brotli: await getBrotliSize(contents)
			};
		} else {
			bundles[name].contentLength = contents.length;
			bundles[name].url = toUrl(appOutput(bundleFile));
		}
	}

	return bundles;
}

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
 * @typedef AppData
 * @property {string} framework
 * @property {string} appName
 * @property {string} htmlUrl
 * @property {string} jsUrl
 * @property {Sizes} totalSizes
 * @property {Record<string, SourceFile>} sources
 * @property {Record<string, BundleFile>} bundles
 *
 * @param {string} framework
 * @param {string} appName
 * @returns {Promise<AppData>}
 */
async function buildAppData(framework, appName) {
	const [sources, bundles] = await Promise.all([
		getSourceFiles(framework, appName),
		getBundleFiles(framework, appName)
	]);

	/** @type {Sizes} */
	const totalSizes = { minified: 0, gzip: 0, brotli: 0 };
	for (let bundle of Object.values(bundles)) {
		totalSizes.minified += bundle.sizes.minified;
		totalSizes.gzip += bundle.sizes.gzip;
		totalSizes.brotli += bundle.sizes.brotli;
	}

	const htmlPath = frameworkOutput(framework, appName, "index.html");
	const entryPath = frameworkOutput(framework, appName, "index.min.js");

	return {
		framework: getDisplayName(framework),
		appName: getDisplayName(appName),
		htmlUrl: toUrl(htmlPath),
		jsUrl: toUrl(entryPath),
		totalSizes,
		sources,
		bundles
	};
}

module.exports = {
	buildFrameworkData
};
