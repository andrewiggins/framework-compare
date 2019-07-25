const { DEFAULT_EXTENSIONS } = require("@babel/core");
const svelte = require("rollup-plugin-svelte");
const babel = require("rollup-plugin-babel");
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [
	svelte(),
	babel({
		extensions: DEFAULT_EXTENSIONS.concat([".html"])
	})
];

module.exports = generateConfigs("svelte", plugins);
