import babel from "@rollup/plugin-babel";
import { generateConfigs } from "../bundleHelpers.js";

const plugins = () => [
	babel({
		babelHelpers: "bundled",
		exclude: /node_modules/
	})
];

export default generateConfigs("preact-signals", plugins);
