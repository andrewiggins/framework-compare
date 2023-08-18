const babel = require("@rollup/plugin-babel").default;
const replace = require("@rollup/plugin-replace");
const commonjs = require("@rollup/plugin-commonjs");
const { generateConfigs } = require("../bundleHelpers");

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

module.exports = generateConfigs("react", plugins);
