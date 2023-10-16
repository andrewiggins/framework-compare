import replace from "@rollup/plugin-replace";
import vue from "rollup-plugin-vue";
import { generateConfigs } from "../bundleHelpers.js";

// Guide to setting up bundler:
// https://github.com/vuejs/vue-next/tree/master/packages/vue#bundler-build-feature-flags

export default generateConfigs("vue", environment => [
	vue(),
	replace({
		preventAssignment: true,
		values: {
			"process.env.NODE_ENV": JSON.stringify(environment)
		}
	})
]);
