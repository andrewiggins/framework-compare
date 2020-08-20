const path = require("path");
const { readdirSync, existsSync } = require("fs");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const { terser } = require("rollup-plugin-terser");

const frameworkOutput = (...args) =>
	path.join(__dirname, "../dist/frameworks", ...args);

const listDirsSync = source =>
	readdirSync(source, { withFileTypes: true })
		.filter(child => child.isDirectory())
		.map(child => child.name);

/**
 * @param {string} frameworkName
 * @param {(environment: Environment) => any[]} plugins
 */
function generateConfigs(frameworkName, plugins) {
	return listDirsSync("./src")
		.map(appFolder => {
			const jsIndexPath = `./src/${appFolder}/index.js`;
			const jsxIndexPath = `./src/${appFolder}/index.jsx`;
			const entry = existsSync(jsxIndexPath) ? jsxIndexPath : jsIndexPath;
			const outputDir = frameworkOutput(frameworkName, appFolder);
			return generateConfig(outputDir, entry, plugins);
		})
		.flat();
}

/**
 * @typedef {"development" | "production"} Environment
 * @param {string} outputDir
 * @param {string} input
 * @param {(environment: Environment) => any[]} customPlugins
 * @param {Environment} [environment = "production"]
 * @returns {import('rollup').RollupOptions}
 */
function generateConfig(
	outputDir,
	input,
	customPlugins,
	environment = "production"
) {
	// @ts-ignore
	let plugins = [
		...customPlugins(environment),
		nodeResolve({
			extensions: [".mjs", ".js", ".jsx", ".json", ".node"]
		})
	];

	return {
		input,
		output: [
			{
				dir: outputDir,
				format: "iife",
				compact: false,
				entryFileNames: `[name].js`,
				chunkFileNames: `[name]-[hash].js`
			},
			{
				dir: outputDir,
				format: "iife",
				compact: true,
				entryFileNames: `[name].min.js`,
				chunkFileNames: `[name]-[hash].min.js`,
				plugins: [terser()]
			}
		],
		plugins,
		watch: {
			clearScreen: false
		}
	};
}

module.exports = { generateConfigs };
