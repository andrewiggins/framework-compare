const path = require("path");
const { writeFile, copyFile } = require("fs").promises;

const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const buble = require("rollup-plugin-buble");
const { h } = require("preact");
const { render } = require("preact-render-to-string");

const { buildFrameworkData } = require("./data");
const { p, outputPath, capitalize, toUrl, ensureDir } = require("./util");

const getRootPath = pageUrl => {
	let url = toUrl(
		path.relative(path.dirname(outputPath(pageUrl)), outputPath())
	);
	if (url !== "") {
		url += "/";
	}

	return url;
};

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
			nodeResolve(),
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
 * @typedef {{ url: string; title?: string; }} LayoutProps
 * @typedef {(page: import('preact').JSX.Element, props: LayoutProps) => string} Renderer
 * @returns {Renderer}
 */
const createRenderer = (components, frameworkData) => (page, layoutProps) => {
	const { Layout } = components;
	const markup = h(
		Layout,
		{
			...layoutProps,
			data: frameworkData,
			rootPath: getRootPath(layoutProps.url)
		},
		page
	);

	return "<!DOCTYPE html>\n" + render(markup, {}, { pretty: true });
};

/**
 * @param {Renderer} renderPage
 * @param {Components["SummaryPage"]} SummaryPage
 * @param {import('./data').FrameworkData} frameworkData
 */
async function buildSummaryView(renderPage, SummaryPage, frameworkData) {
	const url = "index.html";
	const page = h(SummaryPage, { frameworkData });
	const summaryHtml = renderPage(page, { url });
	await writeFile(outputPath("index.html"), summaryHtml, "utf8");
}

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

/**
 * @param {Renderer} renderPage
 * @param {Components["AppPage"]} AppPage
 * @param {import('./data').FrameworkData} frameworkData
 */
async function buildAppViews(renderPage, AppPage, frameworkData) {
	const allApps = frameworkData.reduce(
		(apps, framework) => apps.concat(framework.apps),
		[]
	);

	await Promise.all(
		allApps.map(async app => {
			// TODO: Set active nav
			// TODO: Fix nav links (maybe I should use an HTTP server and absolute links...)

			const title = `${app.name} - ${capitalize(
				app.framework
			)} - Framework Compare`;

			const appSrc = toUrl(path.relative(path.dirname(app.htmlUrl), app.jsUrl));
			const page = h(AppPage, { appSrc });
			const appHtml = renderPage(page, { url: app.htmlUrl, title });

			const htmlPath = outputPath(app.htmlUrl);
			await ensureDir(path.dirname(htmlPath));
			await writeFile(htmlPath, appHtml, "utf8");
		})
	);
}

async function build() {
	const frameworkData = await buildFrameworkData();
	const components = await compileComponents();
	const renderPage = createRenderer(components, frameworkData);

	await ensureDir(outputPath());

	await copyStatics();
	await buildSummaryView(renderPage, components.SummaryPage, frameworkData);
	await buildAppViews(renderPage, components.AppPage, frameworkData);
}

build().catch(e => console.error(e));
