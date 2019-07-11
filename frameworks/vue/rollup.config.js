const replace = require("rollup-plugin-replace");
const commonjs = require("rollup-plugin-commonjs");
const vue = require("rollup-plugin-vue");
const { generateConfigs } = require("../bundleHelpers");

const plugins = environment => [
	// @ts-ignore
	replace({
		"process.env.NODE_ENV": JSON.stringify(environment),
		// "process.env.NODE_ENV": JSON.stringify("development"),
	}),
	// @ts-ignore
	commonjs(),
	// @ts-ignore
	vue({ template: { isProduction: environment === "production" } })
];
module.exports = generateConfigs("vue", plugins);
