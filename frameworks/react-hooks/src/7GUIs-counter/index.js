import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

function App() {
	const [count, setCount] = useState(0);
	return (
		<Fragment>
			<input type="number" value={count} />
			<button onClick={() => setCount(count + 1)}>count</button>
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
