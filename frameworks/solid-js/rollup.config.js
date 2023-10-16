const babel = require("@rollup/plugin-babel").default;
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [
	babel({
		babelHelpers: "bundled"
	})
];

module.exports = generateConfigs("solid-js", plugins);
