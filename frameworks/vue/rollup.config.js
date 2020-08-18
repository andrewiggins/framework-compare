const replace = require("@rollup/plugin-replace");
const commonjs = require("@rollup/plugin-commonjs");
const vue = require("rollup-plugin-vue");
const { generateConfigs } = require("../bundleHelpers");

// Guide to setting up bundler:
// https://github.com/vuejs/vue-next/tree/master/packages/vue#bundler-build-feature-flags

module.exports = generateConfigs("vue", environment => [
	// @ts-ignore
	replace({
		"process.env.NODE_ENV": JSON.stringify(environment)
		// "process.env.NODE_ENV": JSON.stringify("development"),
	}),
	// @ts-ignore
	commonjs(),
	// @ts-ignore
	vue()
]);
