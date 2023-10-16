import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import vue from "rollup-plugin-vue";
import { generateConfigs } from "../bundleHelpers.js";

// Guide to setting up bundler:
// https://github.com/vuejs/vue-next/tree/master/packages/vue#bundler-build-feature-flags

export default generateConfigs("vue", environment => [
	// @ts-ignore
	vue(),
	// @ts-ignore
	replace({
		preventAssignment: true,
		values: {
			"process.env.NODE_ENV": JSON.stringify(environment)
		}
	}),
	// @ts-ignore
	commonjs()
]);
