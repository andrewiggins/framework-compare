import nodeResolve from "rollup-plugin-node-resolve";
import buble from "rollup-plugin-buble";
import { terser } from "rollup-plugin-terser";

export default {
	input: {
		helloWorld: "./src/hello-world/index.js"
	},
	output: {
		dir: "dist",
		format: "iife"
	},
	plugins: [
		nodeResolve(),
		buble({
			jsx: "h"
		}),
		terser()
	]
};
