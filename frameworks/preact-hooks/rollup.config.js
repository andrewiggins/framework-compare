const buble = require("rollup-plugin-buble");
const { listDirsSync } = require("../../scripts/util");
const { generateConfig } = require("../bundleHelpers");

const plugins = () => [buble({ jsx: "h" })];

module.exports = listDirsSync("./src").map(appFolder =>
	generateConfig(
		"preact-hooks",
		`./src/${appFolder}/index.js`,
		"production",
		plugins
	)
);
