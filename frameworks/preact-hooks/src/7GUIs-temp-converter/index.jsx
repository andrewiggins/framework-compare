import { createElement, render, Fragment } from "preact";
import { useState } from "preact/hooks";

function App() {
	const [f, setF] = useState(null);
	const [c, setC] = useState(null);

	function setBothFromC(value) {
		setC(value);
		setF(+(32 + (9 / 5) * value).toFixed(1));
	}

	function setBothFromF(value) {
		setF(value);
		setC(+((5 / 9) * (value - 32)).toFixed(1));
	}

	return (
		<>
			<input
				value={c}
				onInput={e => setBothFromC(e.currentTarget.value)}
				type="number"
			/>{" "}
			°c ={" "}
			<input
				value={f}
				onInput={e => setBothFromF(e.currentTarget.value)}
				type="number"
			/>{" "}
			°f
		</>
	);
}

render(<App />, document.getElementById("app"));
