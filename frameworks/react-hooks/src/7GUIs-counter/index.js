import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

function App() {
	const [count, setCount] = useState(0);
	return (
		<Fragment>
			<div>{count}</div>
			<button onClick={() => setCount(count + 1)}>count</button>
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
