import fs from "fs";
import { pathToFileURL } from "url";
import { repoRoot } from "../util";
import runHelloWorldTests from "../apps/hello-world";
import runCounterTests from "../apps/7GUIs-counter";
import runTempConverterTests from "../apps/7GUIs-temp-converter";
import runFlightBookerTests from "../apps/7GUIs-flight-booker";
import runTimerTests from "../apps/7GUIs-timer";

export function runTests(frameworkName) {
	function runTest(run, appName) {
		const htmlPath = repoRoot(
			`dist/frameworks/${frameworkName}/${appName}/index.html`
		);
		if (fs.existsSync(htmlPath)) {
			run(frameworkName, () => {
				const htmlUrl = pathToFileURL(htmlPath).toString();
				console.log("htmlUrl:", htmlUrl);
				return page.goto(htmlUrl);
			});
		}
	}

	describe(frameworkName, () => {
		runTest(runHelloWorldTests, "hello-world");
		runTest(runCounterTests, "7GUIs-counter");
		runTest(runTempConverterTests, "7GUIs-temp-converter");
		runTest(runFlightBookerTests, "7GUIs-flight-booker");
		runTest(runTimerTests, "7GUIs-timer");
	});
}
