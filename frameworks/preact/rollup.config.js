const babel = require("rollup-plugin-babel");
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [
	babel({
		exclude: /node_modules/
	})
];

module.exports = generateConfigs("preact", plugins);
