import nodeResolve from "rollup-plugin-node-resolve";
const svelte = require("rollup-plugin-svelte");
const { terser } = require("rollup-plugin-terser");
const { frameworkOutput } = require("../../scripts/util");

module.exports = {
	input: {
		helloWorld: "./src/hello-world/index.js"
	},
	output: {
		dir: frameworkOutput("svelte"),
		format: "es"
	},
	plugins: [nodeResolve(), svelte(), terser()],
	watch: {
		clearScreen: false
	}
};
