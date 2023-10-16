const { DEFAULT_EXTENSIONS } = require("@babel/core");
const svelte = require("rollup-plugin-svelte");
const babel = require("@rollup/plugin-babel").default;
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [
	// @ts-expect-error Bad mixing of COMMONJS and ESM
	svelte({
		extensions: [".html"]
	}),
	babel({
		babelHelpers: "bundled",
		extensions: [...DEFAULT_EXTENSIONS, ".html", ".svelte"]
	})
];

module.exports = generateConfigs("svelte", plugins);
