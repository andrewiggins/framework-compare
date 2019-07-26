const path = require("path");
const { readdir } = require("fs").promises;
const { spawn } = require("child_process");
const { p } = require("./util");

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

function runYarn(scriptName, cwd = p()) {
	// Largely inspired by npm-run-all source: https://git.io/fjKNS
	const npmPath = process.env.npm_execpath;
	const npmPathIsJs =
		typeof npmPath === "string" && /\.m?js/.test(path.extname(npmPath));
	const execPath = npmPathIsJs ? process.execPath : npmPath || "yarn";
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
	runYarn("watch", p(`frameworks/${framework}`));
}

function startDevServer() {
	runNode(p("node_modules/serve/bin/serve.js"), [
		p(),
		"-c",
		p("scripts/serve.json")
	]);
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
