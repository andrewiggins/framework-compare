import { repoRoot } from "../util";
import runHelloWorldTests from "../apps/hello-world";
import runCounterTests from "../apps/7GUIs-counter";
import runTempConverterTests from "../apps/7GUIs-temp-converter";
import runFlightBookerTests from "../apps/7GUIs-flight-booker";
import runTimerTests from "../apps/7GUIs-timer";

export function runTests(frameworkName) {
	describe(frameworkName, () => {
		runHelloWorldTests(frameworkName, () => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/hello-world.html`)
			);
		});

		runCounterTests(frameworkName, () => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-counter.html`)
			);
		});

		runTempConverterTests(frameworkName, () => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-temp-converter.html`)
			);
		});

		runFlightBookerTests(frameworkName, () => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-flight-booker.html`)
			);
		});

		runTimerTests(frameworkName, () => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-timer.html`)
			);
		});
	});
}
