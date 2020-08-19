import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import vue from "rollup-plugin-vue";
import { generateConfigs } from "../bundleHelpers.js";

export default generateConfigs("vue", environment => [
	// @ts-ignore
	replace({
		// "process.env.NODE_ENV": JSON.stringify(environment),
		"process.env.NODE_ENV": JSON.stringify("development")
	}),
	// @ts-ignore
	commonjs(),
	// @ts-ignore
	vue({ template: { isProduction: environment === "production" } })
]);
