const svelte = require("rollup-plugin-svelte");
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [svelte()];
module.exports = generateConfigs("svelte", plugins);
