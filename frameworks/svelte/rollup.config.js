import svelte from "rollup-plugin-svelte";
import { generateConfigs } from "../bundleHelpers.js";

const plugins = () => [
	svelte({
		extensions: [".html"]
	})
];

export default generateConfigs("svelte", plugins);
