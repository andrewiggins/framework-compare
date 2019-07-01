const path = require("path");
const fs = require("fs");
const util = require("util");

const dot = require("dot");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const p = (...args) => path.join(__dirname, "..", ...args);

const templateDir = p("scripts/views");

const replaceExt = (fileName, newExt) => {
	let newFilename = path.basename(fileName, path.extname(fileName)) + newExt;
	return path.join(path.dirname(fileName), newFilename);
};

/**
 * @typedef Templates
 * @property {import('dot').RenderFunction} [summary]
 * @property {import('dot').RenderFunction} [app]
 * @returns {Promise<Templates>}
 */
async function compileTemplates() {
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
				body: templateStr
			}
		);
	}

	return templates;
}

/** @type {(app: string) => string} */
const getLinkText = app =>
	app[0].toUpperCase() + app.slice(1).replace(/([A-Z])/g, " $1");
const getFrameworkPath = framework => `frameworks/${framework}/dist`;
const getAppHtmlPath = (fpath, app) =>
	path.join(fpath, replaceExt(app, ".html"));

/**
 * @param {string[]} frameworks
 */
async function buildNav(frameworks) {
	return await Promise.all(
		frameworks.map(async framework => {
			const frameworkPath = getFrameworkPath(framework);
			const distFiles = await readdir(p(frameworkPath));
			const jsFiles = distFiles.filter(file => path.extname(file) === ".js");
			const appNames = jsFiles.map(jsFile => replaceExt(jsFile, ""));
			return {
				text: framework,
				links: appNames.map(appName => ({
					text: getLinkText(appName),
					href: getAppHtmlPath(frameworkPath, appName).replace(/\\/gi, "/")
				}))
			};
		})
	);
}

async function build() {
	const templates = await compileTemplates();
	const frameworks = await readdir(p("frameworks"));
	const nav = await buildNav(frameworks);

	// Root index.html
	const summaryHtml = templates.summary({
		title: "Framework Compare",
		nav,
		headers: ["Preact", "Svelte"],
		data: [["Hello World", 2382, 9034], ["Hello World 2", 2833, 1239]]
	});
	await writeFile(p("index.html"), summaryHtml, "utf8");
}

build();
