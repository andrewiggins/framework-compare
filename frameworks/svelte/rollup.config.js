const svelte = require("rollup-plugin-svelte");
const { listDirsSync } = require("../../scripts/util");
const { generateConfig } = require("../bundleHelpers");

const plugins = () => [svelte()];

module.exports = listDirsSync("./src").map(appFolder =>
	generateConfig("svelte", `./src/${appFolder}/index.js`, "production", plugins)
);
