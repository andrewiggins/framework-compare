import { repoRoot } from "../util";
import runHelloWorldTests from "../apps/hello-world";
import runCounterTests from "../apps/7GUIs-counter";
import runTempConverterTests from "../apps/7GUIs-temp-converter";
import runFlightBookerTests from "../apps/7GUIs-flight-booker";
import runTimerTests from "../apps/7GUIs-timer";

runHelloWorldTests("preact", () => {
	return page.goto(repoRoot("dist/frameworks/preact/hello-world.html"));
});

runCounterTests("preact", () => {
	return page.goto(repoRoot("dist/frameworks/preact/7GUIs-counter.html"));
});

runTempConverterTests("preact", () => {
	return page.goto(
		repoRoot("dist/frameworks/preact/7GUIs-temp-converter.html")
	);
});

runFlightBookerTests("preact", () => {
	return page.goto(repoRoot("dist/frameworks/preact/7GUIs-flight-booker.html"));
});

runTimerTests("preact", () => {
	return page.goto(repoRoot("dist/frameworks/preact/7GUIs-timer.html"));
});
