import path from "path";
import { writeFile, readFile } from "fs/promises";
import { spawnSync } from "child_process";

import { rollup } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sucrase from "@rollup/plugin-sucrase";
import terser from "@rollup/plugin-terser";
import { h } from "preact";
import { render } from "preact-render-to-string";
import postcss from "postcss";
import formatter from "postcss-reporter/lib/formatter.js";
import cssnano from "cssnano";
import sass from "sass";
import { rimraf } from "rimraf";

import { buildFrameworkData } from "./data.js";
import { p, outputPath, ensureDir, listFiles, listDirs } from "./util.js";

import { buildIntroPage } from "./routes/intro.js";
import { buildSummaryView } from "./routes/summary.js";
import { buildAppViews } from "./routes/appViews.js";

const reporter = formatter();

/**
 * @typedef {import('./components/build')} Components
 * @returns {Promise<Components>}
 */
async function compileComponents() {
	/** @type {import('rollup').RollupOptions & { output: import('rollup').OutputOptions }} */
	const config = {
		input: p("scripts/components/build.js"),
		output: {
			file: p("scripts/components/index.js"),
			format: "es"
		},
		external: ["path"],
		plugins: [
			sucrase({
				transforms: ["jsx"],
				jsxPragma: "h",
				production: true
			}),
			commonjs(),
			nodeResolve({
				preferBuiltins: true
			})
		]
	};

	const bundle = await rollup(config);
	await bundle.write(config.output);

	return import("./components/index.js");
}

/**
 * @param {Components} components
 * @param {import('./data').FrameworkData} frameworkData
 * @typedef {{ url: string; title?: string; bodyClass?: string; scripts?: string[] }} LayoutProps
 * @typedef {(page: import('preact').JSX.Element, props: LayoutProps) => string} Renderer
 * @returns {Renderer}
 */
const createRenderer = (components, frameworkData) => (page, layoutProps) => {
	const { Layout } = components;
	const markup = h(Layout, {
		...layoutProps,
		data: frameworkData,
		children: [page]
	});

	return "<!DOCTYPE html>\n" + render(markup, {});
};

/**
 * @param {import('postcss').AcceptedPlugin[]} plugins
 * @param {string} css
 * @param {import('postcss').ProcessOptions} [options]
 */
async function runPostCss(plugins, css, options) {
	/** @type {postcss.Result<postcss.Document | postcss.Root>} */
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
			reporter({
				...result,
				messages,
				source: css
			})
		);
	}

	return result;
}

async function buildSassBundles() {
	const fileNames = await listFiles(p("scripts/bundles"));
	const filePaths = fileNames
		.filter(file => file.endsWith(".scss"))
		.map(name => p("scripts/bundles", name));

	await Promise.all(
		filePaths.map(async from => {
			const packageName = path.basename(from).split(".").shift();
			const to = outputPath(`${packageName}-bundle.min.css`);

			const sassResult = await sass.compileAsync(from);
			const cssResult = await runPostCss([cssnano()], sassResult.css, {
				from,
				to,
				map: {
					inline: false,
					sourcesContent: true,
					prev: sassResult.sourceMap
				}
			});
			await writeFile(to, cssResult.css, "utf8");
		})
	);
}

async function buildJSBundles() {
	const fileNames = await listFiles(p("scripts/bundles"));
	const filePaths = fileNames
		.filter(file => file.endsWith(".js"))
		.map(name => p("scripts/bundles", name));

	/** @type {import('rollup').RollupOptions & { output: import('rollup').OutputOptions }} */
	const config = {
		input: filePaths,
		output: {
			dir: outputPath(),
			format: "iife"
		},
		plugins: [
			sucrase({
				transforms: ["jsx"],
				jsxPragma: "h",
				production: true
			}),
			commonjs(),
			nodeResolve(),
			terser()
		]
	};

	const bundle = await rollup(config);
	await bundle.write(config.output);
}

async function buildSiteAssets() {
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
	await Promise.all([buildSassBundles(), buildJSBundles()]);
	console.timeEnd(stage3);

	let sizeData = {};
	for (let framework of frameworkData) {
		sizeData[framework.id] = {};
		for (let app of framework.apps) {
			sizeData[framework.id][app.appId] = app.totalSizes;
		}
	}

	await writeFile(p("sizes.json"), JSON.stringify(sizeData, null, 2), "utf8");
}

/**
 * @param {string[]} requests Frameworks to build
 */
async function build(requests) {
	const label = "Total Build Time";
	console.time(label);

	// read frameworks dir package.json (to get workspace name)
	const allFrameworks = await listDirs(p("frameworks"));
	const allPkgs = await Promise.all(
		allFrameworks
			.map(f => p("frameworks", f, "package.json"))
			.map(async pkgPath => JSON.parse(await readFile(pkgPath, "utf8")))
	);

	// find all matching frameworks (matching package names)
	/** @type {string[] | undefined} */
	let workspaceNames;
	if (requests == null || requests.length == 0) {
		await rimraf(outputPath());
	} else {
		workspaceNames = allPkgs
			.filter(pkg => requests.find(r => pkg.name.startsWith(r)) != null)
			.map(pkg => pkg.name);
	}

	console.log("Building frameworks...");

	const cmd = process.platform == "win32" ? "npm.cmd" : "npm";
	if (workspaceNames == null) {
		const { stdout, stderr } = spawnSync(
			cmd,
			["run", "build", "-ws", "--if-present"],
			{
				encoding: "utf8"
			}
		);

		console.log(stdout);
		console.log(stderr);

		if (stderr.includes("ERR")) {
			throw new Error("Building frameworks failed");
		}
	} else if (workspaceNames.length == 0) {
		throw new Error(
			`No frameworks were found matching "${requests.join(" ")}"`
		);
	} else {
		const wsOpts = workspaceNames.map(ws => `-w=${ws}`);
		const { stdout, stderr } = spawnSync(cmd, ["run", "build", ...wsOpts], {
			encoding: "utf8"
		});

		console.log(stdout);
		console.log(stderr);

		if (stderr.includes("ERR")) {
			throw new Error("Building frameworks failed");
		}
	}

	console.log("Building site assets...");
	await buildSiteAssets();

	console.timeEnd(label);
}

build(process.argv.slice(2)).catch(e => console.error(e));
