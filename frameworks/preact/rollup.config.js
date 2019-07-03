const path = require("path");
const nodeResolve = require("rollup-plugin-node-resolve");
const buble = require("rollup-plugin-buble");
const { terser } = require("rollup-plugin-terser");
const { frameworkOutput, listDirsSync } = require("../../scripts/util");

function generateConfig(input) {
	const outputFile = path.basename(path.dirname(input)) + ".js";
	return {
		input,
		output: {
			file: frameworkOutput("preact", outputFile),
			format: "iife"
		},
		plugins: [
			// @ts-ignore
			nodeResolve(),
			buble({
				jsx: "h"
			}),
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
