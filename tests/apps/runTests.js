import { repoRoot } from "../util";
import runHelloWorldTests from "../apps/hello-world";
import runCounterTests from "../apps/7GUIs-counter";
import runTempConverterTests from "../apps/7GUIs-temp-converter";
import runFlightBookerTests from "../apps/7GUIs-flight-booker";
import runTimerTests from "../apps/7GUIs-timer";

export function runTests(frameworkName) {
	describe(frameworkName, () => {
		runHelloWorldTests(() => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/hello-world.html`)
			);
		});

		runCounterTests(() => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-counter.html`)
			);
		});

		runTempConverterTests(() => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-temp-converter.html`)
			);
		});

		runFlightBookerTests(() => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-flight-booker.html`)
			);
		});

		runTimerTests(() => {
			return page.goto(
				repoRoot(`dist/frameworks/${frameworkName}/7GUIs-timer.html`)
			);
		});
	});
}
