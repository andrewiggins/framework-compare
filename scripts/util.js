const path = require("path");
const { stat, mkdir } = require("fs").promises;

const p = (...args) => path.join(__dirname, "..", ...args);
const outputPath = (...args) => p("dist", ...args);
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
const toUrl = s => s.replace(/\\/gi, "/");

const getFrameworkPath = (...args) => path.join("frameworks", ...args);
const frameworkOutput = (...args) => outputPath(getFrameworkPath(...args));

async function ensureDir(path) {
	let stats;
	try {
		stats = await stat(path);
	} catch (e) {
		if (e.code == "ENOENT") {
			await mkdir(path, { recursive: true });
			stats = await stat(path);
		}
	}

	if (!stats.isDirectory) {
		throw new Error("Path is not a directory");
	}
}

module.exports = {
	p,
	outputPath,
	toUrl,
	capitalize,
	getFrameworkPath,
	frameworkOutput,
	ensureDir
};
