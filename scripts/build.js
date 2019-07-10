const { writeFile, readFile, copyFile } = require("fs").promises;

const rollup = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
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
	const to = outputPath("spectre-custom.min.css");

	const vendorSrc = (await Promise.all(
		spectreFiles.map(spectreSrcPath).map(filePath => readFile(filePath, "utf8"))
	)).join("\n");

	const result = await runPostCss(
		[uncss({ html: outputPath("**/*.html") })],
		vendorSrc,
		{ from }
	);
	await writeFile(to, result.css, "utf8");
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
	const stage3 = "Building CSS";
	console.time(stage3);
	await Promise.all([buildVendorCss(), buildSiteCss()]);
	console.timeEnd(stage3);
}

build().catch(e => console.error(e));
