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
 * @property {import('dot').RenderFunction} [root]
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

const getLinkName = app => app;
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
			const apps = await readdir(p(frameworkPath));
			return {
				text: framework,
				links: apps.map(app => ({
					text: getLinkName(app),
					href: getAppHtmlPath(frameworkPath, app).replace(/\\/gi, "/")
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
	const rootHtml = templates.root({ nav, title: "Framework Compare" });
	await writeFile(p("index.html"), rootHtml, "utf8");
}

build();
