import { extname } from "path";
import { readdir } from "fs/promises";
import { spawn } from "child_process";
import { p } from "./util.js";

// https://github.com/mysticatea/npm-run-all/issues/105
// https://git.io/fjKbw
// Avoid MaxListenersExceededWarnings.
process.stdout.setMaxListeners(0);
process.stderr.setMaxListeners(0);

/**
 * @param {string} path
 * @param {string[]} args
 * @param {string} [cwd]
 */
function runNode(path, args, cwd = p()) {
	args.unshift(path);
	console.log("$", process.execPath, args.join(" "));
	return spawn(process.execPath, args, {
		stdio: "inherit",
		cwd
	});
}

function runNpm(scriptName, cwd = p()) {
	// Largely inspired by npm-run-all source: https://github.com/mysticatea/npm-run-all/blob/b2260f54537e71483cc412071df3e3bae7ea3b80/lib/run-task.js#L157
	const npmPath = process.env.npm_execpath;
	const npmPathIsJs =
		typeof npmPath === "string" && /\.m?js/.test(extname(npmPath));
	const execPath = npmPathIsJs ? process.execPath : npmPath || "npm";
	const spawnArgs = ["run"];

	if (npmPathIsJs) {
		spawnArgs.unshift(npmPath);
	}

	spawnArgs.push(scriptName);

	return spawn(execPath, spawnArgs, {
		stdio: "inherit",
		shell: !npmPathIsJs,
		cwd
	});
}

function watchScripts() {
	runNode(p("node_modules/nodemon/bin/nodemon.js"), [
		"--watch",
		p("scripts"),
		"--watch",
		p("dist/frameworks"),
		"--ext",
		"js,mjs,json,css,scss",
		"--ignore",
		p("scripts/components/index.js"),
		p("scripts/build.js")
	]);
}

function watchFramework(framework) {
	runNpm("watch", p(`frameworks/${framework}`));
}

function startDevServer() {
	runNode(p("node_modules/sirv-cli/bin.js"), [p(), "--dev"]);
}

async function main() {
	const toWatch = process.argv.slice(2);
	const availableFrameworks = await readdir(p("frameworks"));

	const tasks = [];
	if (toWatch.includes("all")) {
		tasks.push(watchScripts);
		for (let framework of availableFrameworks) {
			tasks.push(() => watchFramework(framework));
		}
	} else {
		if (toWatch.includes("scripts")) {
			tasks.push(watchScripts);
			toWatch.splice(toWatch.indexOf("scripts"), 1);
		}

		for (let framework of toWatch) {
			if (availableFrameworks.includes(framework)) {
				tasks.push(() => watchFramework(framework));
			} else {
				throw new Error(`Unknown framework given to watch: "${framework}"`);
			}
		}
	}

	tasks.push(startDevServer);

	tasks.forEach(task => task());
}

main();
