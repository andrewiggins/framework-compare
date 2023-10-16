import { DEFAULT_EXTENSIONS } from "@babel/core";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { generateConfigs } from "../bundleHelpers.js";

const plugins = () => [
	svelte({
		extensions: [".html"]
	}),
	babel({
		babelHelpers: "bundled",
		extensions: [...DEFAULT_EXTENSIONS, ".html", ".svelte"]
	})
];

export default generateConfigs("svelte", plugins);
