const path = require("path");
const nodeResolve = require("rollup-plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const { listDirsSync, frameworkOutput } = require("../scripts/util");

/**
 * @param {string} frameworkName
 * @param {(environment: Environment) => any[]} plugins
 */
function generateConfigs(frameworkName, plugins) {
	return listDirsSync("./src").map(appFolder =>
		generateConfig(
			frameworkName,
			`./src/${appFolder}/index.js`,
			"production",
			plugins
		)
	);
}

/**
 * @typedef {"development" | "production"} Environment
 * @param {string} frameworkName
 * @param {string} input
 * @param {Environment} environment
 * @param {(environment: Environment) => any[]} customPlugins
 */
function generateConfig(frameworkName, input, environment, customPlugins) {
	const extension = environment == "production" ? ".min.js" : ".js";
	const outputFile = path.basename(path.dirname(input)) + extension;

	// @ts-ignore
	let plugins = [...customPlugins(environment), nodeResolve()];
	if (environment === "production") {
		plugins.push(terser());
	}

	return {
		input,
		output: {
			file: frameworkOutput(frameworkName, outputFile),
			format: "iife",
			compact: environment === "production"
		},
		plugins,
		watch: {
			clearScreen: false
		}
	};
}

module.exports = { generateConfigs };
