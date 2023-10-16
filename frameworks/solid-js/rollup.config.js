import babel from "@rollup/plugin-babel";
import { generateConfigs } from "../bundleHelpers.js";

const plugins = () => [
	babel({
		babelHelpers: "bundled"
	})
];

export default generateConfigs("solid-js", plugins);
