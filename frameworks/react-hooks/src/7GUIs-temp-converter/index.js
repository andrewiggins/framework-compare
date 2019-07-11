import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

function App() {
	const [f, setF] = useState(null);
	const [c, setC] = useState(null);

	function setBothFromC(value) {
		setC(+value);
		setF(+(32 + (9 / 5) * value).toFixed(1));
	}

	function setBothFromF(value) {
		setF(+value);
		setC(+((5 / 9) * (value - 32)).toFixed(1));
	}

	return (
		<Fragment>
			<input
				value={c}
				onInput={e => setBothFromC(e.target.value)}
				type="number"
			/>{" "}
			°c ={" "}
			<input
				value={f}
				onInput={e => setBothFromF(e.target.value)}
				type="number"
			/>{" "}
			°f
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
