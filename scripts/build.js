const { writeFile, readFile, copyFile } = require("fs").promises;

const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const buble = require("rollup-plugin-buble");
const { h } = require("preact");
const { render } = require("preact-render-to-string");
const prettier = require("prettier");
const postcss = require("postcss");
const reporter = require("postcss-reporter/lib/formatter")();
const cssnano = require("cssnano");
const uncss = require("postcss-uncss");

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
			buble({
				jsx: "h",
				transforms: {
					dangerousForOf: true
				}
			}),
			//@ts-ignore
			commonjs(),
			// @ts-ignore
			nodeResolve({
				preferBuiltIns: true
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

/**
 * @param {import('postcss').AcceptedPlugin[]} plugins
 * @param {string} css
 * @param {import('postcss').ProcessOptions} [options]
 */
async function runPostCss(plugins, css, options) {
	let result;
	try {
		result = await postcss(plugins).process(css, options);
	} catch (error) {
		if (error.name === "CssSyntaxError") {
			process.stderr.write(error.message + error.showSourceCode());
		} else {
			throw error;
		}
	}

	const messages = result.warnings();
	if (messages.length) {
		console.warn(
			reporter(
				Object.assign({}, result, {
					messages
				})
			)
		);
	}

	return result;
}

async function buildSiteCss() {
	const from = p("./scripts/site.css");
	const to = outputPath("site.min.css");
	const css = await readFile(from, "utf8");

	const result = await runPostCss([cssnano()], css, { from, to });
	await writeFile(to, result.css, "utf8");
}

async function buildVendorCss() {
	const spectreFiles = [
		"spectre.min.css",
		"spectre-exp.min.css",
		"spectre-icons.min.css"
	];

	const spectreSrcPath = file => p("node_modules/spectre.css/dist", file);
	const from = spectreSrcPath(spectreFiles[0]);
	const to = outputPath("vendor.min.css");

	const vendorSrc = (await Promise.all([
		...spectreFiles
			.map(spectreSrcPath)
			.map(filePath => readFile(filePath, "utf8")),
		readFile(
			p("node_modules/prismjs/plugins/line-numbers/prism-line-numbers.css"),
			"utf8"
		),
		readFile(p("node_modules/prismjs/themes/prism.css"), "utf8")
	])).join("\n");

	// const result = await runPostCss(
	// 	[uncss({ html: [p("index.html"), outputPath("**/*.html")] })],
	// 	vendorSrc,
	// 	{ from }
	// );
	// await writeFile(to, result.css, "utf8");

	await writeFile(to, vendorSrc, "utf8");
}

async function copyStatics() {
	await Promise.all([
		copyFile(p("node_modules/prismjs/prism.js"), outputPath("prism.js")),
		copyFile(p("node_modules/prismjs/components/prism-jsx.min.js"), outputPath("prism-jsx.min.js")),
		copyFile(
			p("node_modules/prismjs/plugins/line-numbers/prism-line-numbers.min.js"),
			outputPath("prism-line-numbers.min.js")
		)
	]);
}

async function build() {
	const stage1 = "Compiling components and data";
	console.time(stage1);
	const [frameworkData, components] = await Promise.all([
		buildFrameworkData(),
		compileComponents(),
		ensureDir(outputPath())
	]);
	console.timeEnd(stage1);

	const renderPage = createRenderer(components, frameworkData);

	const stage2 = "Building HTML";
	console.time(stage2);
	await Promise.all([
		buildIntroPage(renderPage, components.IntroPage),
		buildSummaryView(renderPage, components.SummaryPage, frameworkData),
		buildAppViews(renderPage, components.AppPage, frameworkData)
	]);
	console.timeEnd(stage2);

	// Uses built HTML to remove unused CSS
	const stage3 = "Building CSS and copying libraries";
	console.time(stage3);
	await Promise.all([buildVendorCss(), buildSiteCss(), copyStatics()]);
	console.timeEnd(stage3);
}

build().catch(e => console.error(e));
