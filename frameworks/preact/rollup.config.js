const babel = require("rollup-plugin-babel");
const { generateConfigs } = require("../bundleHelpers");

const plugins = () => [babel()];
module.exports = generateConfigs("preact", plugins);
