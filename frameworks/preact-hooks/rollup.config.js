const buble = require("rollup-plugin-buble");
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [buble({ jsx: "h" })];
module.exports = generateConfigs("preact-hooks", plugins);
