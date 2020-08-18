const babel = require("@rollup/plugin-babel").default;
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [
	babel({
		babelHelpers: "bundled",
		exclude: /node_modules/
	})
];

module.exports = generateConfigs("preact", plugins);
