const path = require("path");
const fs = require("fs").promises;
const util = require("util");

const dot = require("dot");
const gzipSize = require("gzip-size");

const { readFile, writeFile, copyFile, readdir, stat, mkdir } = fs;
const p = (...args) => path.join(__dirname, "..", ...args);

const templateDir = p("scripts/views");

const replaceExt = (fileName, newExt) => {
	let newFilename = path.basename(fileName, path.extname(fileName)) + newExt;
	return path.join(path.dirname(fileName), newFilename);
};

async function ensureDir(path) {
	let stats;
	try {
		stats = await stat(path);
	} catch (e) {
		if (e.code == "ENOENT") {
			await mkdir(path, { recursive: true });
			stats = await stat(path);
		}
	}

	if (!stats.isDirectory) {
		throw new Error("Path is not a directory");
	}
}

/**
 * @param {FrameworkData} frameworkData
 * @typedef Templates
 * @property {import('dot').RenderFunction} [summary]
 * @property {import('dot').RenderFunction} [app]
 * @returns {Promise<Templates>}
 */
async function compileTemplates(frameworkData) {
	const navData = buildNav(frameworkData);
	const navRawTemplate = await readFile(p("scripts/nav.html"), "utf8");
	const navHtml = dot.compile(navRawTemplate)({ nav: navData });

	const layout = await readFile(p("scripts/layout.html"), "utf8");
	const templateNames = await readdir(templateDir);
	const templateSettings = {
		...dot.templateSettings,
		strip: false
	};

	const templates = {};
	for (let templateName of templateNames) {
		let templatePath = path.join(templateDir, templateName);
		let templateStr = await readFile(templatePath, "utf8");
		templates[path.parse(templateName).name] = dot.template(
			layout,
			templateSettings,
			{
				nav: navHtml,
				body: templateStr
			}
		);
	}

	return templates;
}

/** @type {(app: string) => string} */
const getAppName = app =>
	app[0].toUpperCase() + app.slice(1).replace(/([A-Z])/g, " $1");
const getFrameworkPath = framework => `frameworks/${framework}/dist`;
const getAppHtmlPath = (fpath, app) =>
	path.join(fpath, replaceExt(app, ".html"));
const getAppJsPath = (fpath, app) => path.join(fpath, app);
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * @typedef {{ name: string; htmlUrl: string; jsFile: string; gzipSize: number; }} AppData
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
						name: getAppName(appName),
						htmlUrl: htmlPath.replace(/\\/gi, "/"),
						jsFile: jsPath.replace(/\\/gi, "/"),
						gzipSize: await gzipSize(jsContents)
					};
				})
			);

			return { name, apps };
		})
	);
}

/**
 * @param {FrameworkData} frameworks
 */
function buildNav(frameworks) {
	return frameworks.map(framework => ({
		text: framework.name,
		links: framework.apps.map(app => ({
			text: getAppName(app.name),
			href: app.htmlUrl
		}))
	}));
}

/**
 * @param {Templates} templates
 * @param {FrameworkData} frameworkData
 */
async function buildSummaryView(templates, frameworkData) {
	/** @type {Record<string, Record<string, AppData>>} */
	let apps = {};
	for (let framework of frameworkData) {
		for (let app of framework.apps) {
			if (!(app.name in apps)) {
				apps[app.name] = {};
			}

			apps[app.name][framework.name] = app;
		}
	}

	const frameworks = frameworkData.map(f => f.name);

	/** @type {Array<Array<string | number>>} */
	const data = [];
	for (let appName of Object.keys(apps)) {
		/** @type {Array<string | number>} */
		const row = [appName];
		for (let framework of frameworks) {
			row.push(apps[appName][framework].gzipSize);
		}

		data.push(row);
	}

	const summaryHtml = templates.summary({
		title: "Framework Compare",
		headers: frameworks.map(f => capitalize(f)),
		data
	});
	await writeFile(p("dist/index.html"), summaryHtml, "utf8");
}

/**
 * @param {(...args: string[]) => string} getOutputPath
 */
async function copyStatics(getOutputPath) {
	const spectreFiles = [
		"spectre.min.css",
		"spectre-exp.min.css",
		"spectre-icons.min.css"
	];

	const spectreSrc = (...args) => p("node_modules/spectre.css/dist", ...args);
	await Promise.all(
		spectreFiles.map(file => copyFile(spectreSrc(file), getOutputPath(file)))
	);
}

async function build() {
	const frameworkData = await buildFrameworkData();
	const templates = await compileTemplates(frameworkData);

	const getOutputPath = (...args) => p("dist", ...args);
	ensureDir(getOutputPath());

	await copyStatics(getOutputPath);
	await buildSummaryView(templates, frameworkData);
}

build();
