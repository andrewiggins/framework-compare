import { render } from "preact";
import { useState } from "preact/hooks";
import {
	action,
	createModelFactory,
	useModel
} from "../../../../lib/createModelFactory";
import { signal } from "@preact/signals";

const createTempConverter = createModelFactory(() => {
	const celsius = signal("");
	const fahrenheit = signal("");

	const setCelsius = action(value => {
		celsius.value = value;
		fahrenheit.value = value === "" ? "" : (32 + (9 / 5) * +value).toFixed(1);
	});

	const setFahrenheit = action(value => {
		fahrenheit.value = value;
		celsius.value = value === "" ? "" : ((5 / 9) * (+value - 32)).toFixed(1);
	});

	return {
		state: { celsius, fahrenheit },
		actions: { setCelsius, setFahrenheit }
	};
});

function App() {
	const tempConverter = useModel(() => createTempConverter());

	return (
		<>
			<input
				value={tempConverter.celsius}
				onInput={e => tempConverter.setCelsius(e.currentTarget.value)}
				type="number"
			/>{" "}
			°c ={" "}
			<input
				value={tempConverter.fahrenheit}
				onInput={e => tempConverter.setFahrenheit(e.currentTarget.value)}
				type="number"
			/>{" "}
			°f
		</>
	);
}

render(<App />, document.getElementById("app"));
