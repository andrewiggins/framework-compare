import { existsSync } from "fs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import { listDirsSync, frameworkOutput } from "../scripts/util.js";

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
			return [
				generateConfig(outputDir, entry, false, plugins),
				generateConfig(outputDir, entry, true, plugins)
			];
		})
		.flat();
}

/**
 * @typedef {"development" | "production"} Environment
 * @param {string} outputDir
 * @param {string} input
 * @param {boolean} minify
 * @param {(environment: Environment) => any[]} customPlugins
 * @param {Environment} [environment = "production"]
 */
function generateConfig(
	outputDir,
	input,
	minify,
	customPlugins,
	environment = "production"
) {
	const extension = minify ? ".min.js" : ".js";

	// @ts-ignore
	let plugins = [
		...customPlugins(environment),
		nodeResolve({
			extensions: [".mjs", ".js", ".jsx", ".json", ".node"]
		})
	];
	if (minify) {
		plugins.push(terser());
	}

	return {
		input,
		output: {
			dir: outputDir,
			format: "iife",
			compact: minify,
			entryFileNames: `[name]${extension}`,
			chunkFileNames: `[name]-[hash]${extension}`
		},
		plugins,
		watch: {
			clearScreen: false
		}
	};
}
