const path = require("path");
const fs = require("fs");
const nodeResolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const { listDirsSync, frameworkOutput } = require("../scripts/util");

/**
 * @param {string} frameworkName
 * @param {(environment: Environment) => any[]} plugins
 */
function generateConfigs(frameworkName, plugins) {
	return listDirsSync("./src").map(appFolder => {
		const jsIndexPath = `./src/${appFolder}/index.js`;
		const jsxIndexPath = `./src/${appFolder}/index.jsx`;
		return generateConfig(
			frameworkOutput(frameworkName, appFolder),
			fs.existsSync(jsxIndexPath) ? jsxIndexPath : jsIndexPath,
			"production",
			plugins
		);
	});
}

/**
 * @typedef {"development" | "production"} Environment
 * @param {string} outputDir
 * @param {string} input
 * @param {Environment} environment
 * @param {(environment: Environment) => any[]} customPlugins
 */
function generateConfig(outputDir, input, environment, customPlugins) {
	const isProd = environment === "production";
	const extension = isProd ? ".min.js" : ".js";

	// @ts-ignore
	let plugins = [...customPlugins(environment), nodeResolve()];
	if (isProd) {
		plugins.push(terser());
	}

	return {
		input,
		output: {
			dir: outputDir,
			format: "iife",
			compact: isProd,
			entryFileNames: `[name]${extension}`,
			chunkFileNames: `[name]-[hash]${extension}`
		},
		plugins,
		watch: {
			clearScreen: false
		}
	};
}

module.exports = { generateConfigs };
