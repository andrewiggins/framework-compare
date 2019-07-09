const { copyFile } = require("fs").promises;

const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const buble = require("rollup-plugin-buble");
const { h } = require("preact");
const { render } = require("preact-render-to-string");
const prettier = require("prettier");

const { buildFrameworkData } = require("./data");
const { p, outputPath, ensureDir } = require("./util");

const { buildIntroPage } = require("./routes/intro");
const { buildSummaryView } = require("./routes/summary");
const { buildAppViews } = require("./routes/appViews");

/**
 * @typedef {import('./components/build')} Components
 * @returns {Promise<Components>}
 */
async function compileComponents() {
	const config = {
		input: p("scripts/components/build.js"),
		output: {
			file: p("scripts/components/index.js"),
			format: /** @type {import('rollup').ModuleFormat} */ ("commonjs")
		},
		plugins: [
			// @ts-ignore
			nodeResolve({
				preferBuiltIns: true
			}),
			buble({
				jsx: "h",
				transforms: {
					dangerousForOf: true
				}
			})
		]
	};

	const bundle = await rollup.rollup(config);
	await bundle.write(config.output);

	return require("./components/index");
}

/**
 * @param {Components} components
 * @param {import('./data').FrameworkData} frameworkData
 * @typedef {{ url: string; title?: string; bodyClass?: string; }} LayoutProps
 * @typedef {(page: import('preact').JSX.Element, props: LayoutProps) => string} Renderer
 * @returns {Renderer}
 */
const createRenderer = (components, frameworkData) => (page, layoutProps) => {
	const { Layout } = components;
	const markup = h(
		Layout,
		{
			...layoutProps,
			data: frameworkData
		},
		page
	);

	const html = "<!DOCTYPE html>\n" + render(markup, {});
	return prettier.format(html, { parser: "html" });
};

async function copyStatics() {
	const spectreFiles = [
		"spectre.min.css",
		"spectre-exp.min.css",
		"spectre-icons.min.css"
	];

	const spectreSrc = (...args) => p("node_modules/spectre.css/dist", ...args);
	await Promise.all([
		...spectreFiles.map(file => copyFile(spectreSrc(file), outputPath(file))),
		copyFile(p("scripts/site.css"), outputPath("site.css"))
	]);
}

async function build() {
	const frameworkData = await buildFrameworkData();
	const components = await compileComponents();
	const renderPage = createRenderer(components, frameworkData);

	await ensureDir(outputPath());

	await copyStatics();
	await buildIntroPage(renderPage, components.IntroPage);
	await buildSummaryView(renderPage, components.SummaryPage, frameworkData);
	await buildAppViews(renderPage, components.AppPage, frameworkData);
}

build().catch(e => console.error(e));
