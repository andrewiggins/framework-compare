import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import { generateConfigs } from "../bundleHelpers.js";

const plugins = environment => [
	babel({
		babelHelpers: "bundled",
		exclude: /node_modules/
	}),
	// @ts-ignore
	replace({
		preventAssignment: true,
		values: {
			"process.env.NODE_ENV": JSON.stringify(environment)
		}
	}),
	// @ts-ignore
	commonjs()
];

export default generateConfigs("react-hooks", plugins);
