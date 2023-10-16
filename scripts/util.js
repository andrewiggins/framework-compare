import path from "path";
import { fileURLToPath } from "url";
import { stat, mkdir, readdir } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const listDirs = async source =>
	(await readdir(source, { withFileTypes: true }))
		.filter(child => child.isDirectory())
		.map(child => child.name);

export const listFiles = async source =>
	(await readdir(source, { withFileTypes: true }))
		.filter(child => child.isFile())
		.map(child => child.name);

export const toTitleCase = str => {
	return str.replace(/\w\S*/g, txt => {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
};

export const p = (...args) => path.join(__dirname, "..", ...args);
export const outputPath = (...args) => p("dist", ...args);
export const toUrl = s => path.relative(outputPath(), s).replace(/\\/gi, "/");

export const frameworkOutput = (...args) => outputPath("frameworks", ...args);
export const srcPath = (framework, app, ...args) =>
	p("frameworks", framework, "src", app, ...args);

/** @type {(id: string) => string} */
export const getDisplayName = id => {
	if (id == "lit-html") {
		return "lit-html";
	}

	return toTitleCase(id.replace(/-/g, " "));
};

export async function ensureDir(path) {
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
