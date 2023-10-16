import path from "path";
import { readdirSync, existsSync } from "fs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = new URL(".", import.meta.url).pathname;

const frameworkOutput = (...args) =>
	path.join(__dirname, "../dist/frameworks", ...args);

const listDirsSync = source =>
	readdirSync(source, { withFileTypes: true })
		.filter(child => child.isDirectory())
		.map(child => child.name);

/**
 * @param {string} frameworkName
 * @param {(environment: Environment) => any[]} plugins
 */
export function generateConfigs(frameworkName, plugins) {
	return listDirsSync("./src")
		.map(appFolder => {
			const jsIndexPath = `./src/${appFolder}/index.js`;
			const jsxIndexPath = `./src/${appFolder}/index.jsx`;
			const entry = existsSync(jsxIndexPath) ? jsxIndexPath : jsIndexPath;
			const outputDir = frameworkOutput(frameworkName, appFolder);

			return generateConfig(
				`${frameworkName} - ${appFolder}`,
				outputDir,
				entry,
				plugins
			);
		})
		.flat();
}

/**
 * @typedef {"development" | "production"} Environment
 * @param {string} title,
 * @param {string} outputDir
 * @param {string} input
 * @param {(environment: Environment) => import('rollup').Plugin[]} customPlugins
 * @param {Environment} [environment = "production"]
 * @returns {import('rollup').RollupOptions}
 */
function generateConfig(
	title,
	outputDir,
	input,
	customPlugins,
	environment = "production"
) {
	let plugins = [
		...customPlugins(environment),
		nodeResolve({
			extensions: [".mjs", ".js", ".jsx", ".json", ".node"]
		}),
		visualizer({
			filename: path.join(outputDir, "bundleStats.html"),
			title: `${title} - Bundle Stats`
		})
	];

	return {
		input,
		output: [
			{
				dir: outputDir,
				format: "iife",
				compact: false,
				entryFileNames: `[name].js`,
				chunkFileNames: `[name]-[hash].js`
			},
			{
				dir: outputDir,
				format: "iife",
				compact: true,
				entryFileNames: `[name].min.js`,
				chunkFileNames: `[name]-[hash].min.js`,
				plugins: [terser()]
			}
		],
		plugins,
		watch: {
			clearScreen: false
		}
	};
}
