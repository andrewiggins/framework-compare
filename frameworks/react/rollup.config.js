const babel = require("rollup-plugin-babel");
const replace = require("@rollup/plugin-replace");
const commonjs = require("@rollup/plugin-commonjs");
const { generateConfigs } = require("../bundleHelpers");

const plugins = environment => [
	babel({
		exclude: /node_modules/
	}),
	// @ts-ignore
	replace({
		"process.env.NODE_ENV": JSON.stringify(environment)
	}),
	// @ts-ignore
	commonjs()
];

module.exports = generateConfigs("react", plugins);
