const path = require("path");
const { readdirSync } = require("fs");
const { stat, mkdir, readdir } = require("fs").promises;

const listDirsSync = source =>
	readdirSync(source, { withFileTypes: true })
		.filter(child => child.isDirectory())
		.map(child => child.name);

const listDirs = async source =>
	(await readdir(source, { withFileTypes: true }))
		.filter(child => child.isDirectory())
		.map(child => child.name);

const listFiles = async source =>
	(await readdir(source, { withFileTypes: true }))
		.filter(child => child.isFile())
		.map(child => child.name);

const toTitleCase = str => {
	return str.replace(/\w\S*/g, txt => {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
};

const p = (...args) => path.join(__dirname, "..", ...args);
const outputPath = (...args) => p("dist", ...args);
const toUrl = s => path.relative(p(), s).replace(/\\/gi, "/");

const frameworkOutput = (...args) => outputPath("frameworks", ...args);
const srcPath = (framework, app, ...args) => p("frameworks", framework, "src", app, ...args);

/** @type {(app: string) => string} */
const getDisplayName = app => toTitleCase(app.replace(/-/g, " "));

async function ensureDir(path) {
	let stats;
	try {
		stats = await stat(path);
	} catch (e) {
		if (e.code == "ENOENT") {
			await mkdir(path, { recursive: true });
			stats = await stat(path);
		} else {
			throw e;
		}
	}

	if (!stats.isDirectory) {
		throw new Error("Path is not a directory");
	}
}

module.exports = {
	listDirs,
	listDirsSync,
	listFiles,
	p,
	outputPath,
	toUrl,
	toTitleCase,
	frameworkOutput,
	srcPath,
	getDisplayName,
	ensureDir
};
