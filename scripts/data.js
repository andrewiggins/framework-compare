import { readFile } from "fs/promises";
import getGzipSize from "gzip-size";
import brotliSize from "brotli-size";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import {
	toUrl,
	frameworkOutput,
	listDirs,
	listFiles,
	srcPath
} from "./util.js";

loadLanguages(["jsx"]);

const getBrotliSize = brotliSize.default;
const getLang = ext => (ext === "vue" ? "html" : ext);

/**
 * @typedef SourceFile
 * @property {string} name
 * @property {string} lang
 * @property {string} contents
 * @property {string} htmlContents
 *
 * @param {string} frameworkId
 * @param {string} appId
 *
 * @returns {Promise<Record<string, SourceFile>>}
 */
async function getSourceFiles(frameworkId, appId) {
	let srcFiles = await listFiles(srcPath(frameworkId, appId));

	const sourceFiles = await Promise.all(
		srcFiles.map(async srcFile => {
			const contents = await readFile(
				srcPath(frameworkId, appId, srcFile),
				"utf8"
			);

			const lang = getLang(srcFile.split(".").pop());
			return {
				name: srcFile,
				lang,
				contents,
				htmlContents: Prism.highlight(contents, Prism.languages[lang], lang)
			};
		})
	);

	/** @type {Record<string, SourceFile>} */
	const sources = {};
	for (let sourceFile of sourceFiles) {
		sources[sourceFile.name] = sourceFile;
	}

	return sources;
}

/**
 * @typedef Sizes
 * @property {number} raw
 * @property {number} minified
 * @property {number} gzip
 * @property {number} brotli
 *
 * @typedef BundleFile
 * @property {string} name
 * @property {string} lang
 * @property {string} url
 * @property {Sizes} sizes
 *
 * @param {string} frameworkId
 * @param {string} appId
 *
 * @returns {Promise<Record<string, BundleFile>>}
 */
async function getBundleFiles(frameworkId, appId) {
	const appOutput = (...args) => frameworkOutput(frameworkId, appId, ...args);
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
			bundles[name] = {
				name,
				lang,
				url: "",
				sizes: { raw: 0, minified: 0, gzip: 0, brotli: 0 }
			};
		}

		if (bundleFile.endsWith(".min.js")) {
			bundles[name].sizes.minified = contents.length;
			bundles[name].sizes.gzip = await getGzipSize(contents);
			bundles[name].sizes.brotli = await getBrotliSize(contents);
		} else {
			bundles[name].sizes.raw = contents.length;
			bundles[name].url = toUrl(appOutput(bundleFile));
		}
	}

	return bundles;
}

/**
 * @typedef {Array<{ id: string; apps: AppData[] }>} FrameworkData
 * @returns {Promise<FrameworkData>}
 */
export async function buildFrameworkData() {
	const frameworks = await listDirs(frameworkOutput());
	return await Promise.all(
		frameworks.map(async framework => {
			const appFolders = await listDirs(frameworkOutput(framework));
			const apps = await Promise.all(
				appFolders.map(async (appName, i) => buildAppData(framework, appName))
			);

			return { id: framework, apps };
		})
	);
}

/**
 * @typedef AppData
 * @property {string} frameworkId
 * @property {string} appId
 * @property {string} htmlUrl
 * @property {string} jsUrl
 * @property {Sizes} totalSizes
 * @property {Record<string, SourceFile>} sources
 * @property {Record<string, BundleFile>} bundles
 *
 * @param {string} frameworkId
 * @param {string} appId
 * @returns {Promise<AppData>}
 */
async function buildAppData(frameworkId, appId) {
	const [sources, bundles] = await Promise.all([
		getSourceFiles(frameworkId, appId),
		getBundleFiles(frameworkId, appId)
	]);

	/** @type {Sizes} */
	const totalSizes = { raw: 0, minified: 0, gzip: 0, brotli: 0 };
	for (let bundle of Object.values(bundles)) {
		totalSizes.raw += bundle.sizes.raw;
		totalSizes.minified += bundle.sizes.minified;
		totalSizes.gzip += bundle.sizes.gzip;
		totalSizes.brotli += bundle.sizes.brotli;
	}

	const htmlPath = frameworkOutput(frameworkId, appId, "index.html");
	const entryPath = frameworkOutput(frameworkId, appId, "index.min.js");

	return {
		frameworkId,
		appId: appId,
		htmlUrl: toUrl(htmlPath),
		jsUrl: toUrl(entryPath),
		totalSizes,
		sources,
		bundles
	};
}
