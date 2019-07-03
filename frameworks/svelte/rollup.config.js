const path = require("path");
const nodeResolve = require("rollup-plugin-node-resolve");
const svelte = require("rollup-plugin-svelte");
const { terser } = require("rollup-plugin-terser");
const { frameworkOutput, listDirsSync } = require("../../scripts/util");

/**
 * @param {string} input
 */
function generateConfig(input) {
	const outputFile = path.basename(path.dirname(input)) + ".js";
	return {
		input,
		output: {
			file: frameworkOutput("svelte", outputFile),
			format: "iife",
			compact: true
		},
		plugins: [
			// @ts-ignore
			nodeResolve(),
			svelte(),
			terser()
		],
		watch: {
			clearScreen: false
		}
	};
}

module.exports = listDirsSync("./src").map(appFolder =>
	generateConfig(`./src/${appFolder}/index.js`)
);
