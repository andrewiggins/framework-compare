import { render } from "preact";
import { createModel, useModel } from "../../../../lib/model/createModel.js";
import { signal } from "@preact/signals";

const TempConverter = createModel(() => {
	const celsius = signal("");
	const fahrenheit = signal("");

	const setCelsius = value => {
		celsius.value = value;
		fahrenheit.value = value === "" ? "" : (32 + (9 / 5) * +value).toFixed(1);
	};

	const setFahrenheit = value => {
		fahrenheit.value = value;
		celsius.value = value === "" ? "" : ((5 / 9) * (+value - 32)).toFixed(1);
	};

	return {
		celsius,
		fahrenheit,
		setCelsius,
		setFahrenheit
	};
});

function App() {
	const tempConverter = useModel(TempConverter);

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
