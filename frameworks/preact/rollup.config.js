const nodeResolve = require("rollup-plugin-node-resolve");
const buble = require("rollup-plugin-buble");
const { terser } = require("rollup-plugin-terser");
const { frameworkOutput } = require("../../scripts/util");

export default {
	input: {
		helloWorld: "./src/hello-world/index.js"
	},
	output: {
		dir: frameworkOutput("preact"),
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
