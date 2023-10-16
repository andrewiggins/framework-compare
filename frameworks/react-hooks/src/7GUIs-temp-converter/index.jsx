import { useState } from "react";
import ReactDOM from "react-dom";

function App() {
	const [f, setF] = useState("");
	const [c, setC] = useState("");

	// React doesn't support `valueAsNumber` on controlled inputs, so we have to
	// manually do some formatting here.
	//
	// First format to have one fraction digit. Then convert back to number so
	// we drop any unnecessary ".0" from the end of whole numbers. Finally
	// convert back to string since that is the type our state expects. Our
	// state is a string so the inputs can start with an empty state instead of
	// a number.

	function setBothFromC(value) {
		const newC = +(32 + (9 / 5) * value).toFixed(1);
		setC(value);
		setF("" + newC);
	}

	function setBothFromF(value) {
		const newF = +((5 / 9) * (value - 32)).toFixed(1);
		setF(value);
		setC("" + newF);
	}

	return (
		<>
			<input
				value={c}
				onChange={e => setBothFromC(e.target.value)}
				type="number"
			/>{" "}
			°c ={" "}
			<input
				value={f}
				onChange={e => setBothFromF(e.target.value)}
				type="number"
			/>{" "}
			°f
		</>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
