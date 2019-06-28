import nodeResolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";

export default {
	input: {
		helloWorld: "./src/hello-world/index.js"
	},
	output: {
		dir: "dist",
		format: "es"
	},
	plugins: [
		nodeResolve(),
		svelte(),
		terser()
	]
};
