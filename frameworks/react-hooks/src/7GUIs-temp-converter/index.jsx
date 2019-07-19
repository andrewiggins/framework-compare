import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

function App() {
	const [f, setF] = useState("");
	const [c, setC] = useState("");

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
