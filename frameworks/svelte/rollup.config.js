const { DEFAULT_EXTENSIONS } = require("@babel/core");
const svelte = require("rollup-plugin-svelte");
const babel = require("@rollup/plugin-babel").default;
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [
	svelte(),
	babel({
		babelHelpers: "bundled",
		extensions: DEFAULT_EXTENSIONS.concat([".html"])
	})
];

module.exports = generateConfigs("svelte", plugins);
