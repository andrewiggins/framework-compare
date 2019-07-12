import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

function App() {
	const [count, setCount] = useState(0);
	return (
		<Fragment>
			<button
				className="btn badge"
				data-badge={count}
				style={{ marginTop: ".5rem" }}
				onClick={() => setCount(count + 1)}
			>
				count: {count}
			</button>
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
