const path = require("path");
const fs = require("fs");
const util = require("util");

const dot = require("dot");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const p = (...args) => path.join(__dirname, "..", ...args);

const templateDir = p("scripts/views");

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

async function build() {
	const templates = await compileTemplates();
	const frameworks = await readdir(p("frameworks"));

	// Root index.html
	const nav = frameworks.map(name => ({
		text: name,
		links: [
			{
				text: "Hello World",
				href: "#"
			}
		]
	}));
	const rootHtml = templates.root({ nav, title: "Framework Compare" });
	await writeFile(p("index.html"), rootHtml, "utf8");
}

build();
