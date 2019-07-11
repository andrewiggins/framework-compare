import { h, Fragment, render } from "preact";
import { useState } from "preact/hooks";

function App() {
	const [count, setCount] = useState(0);
	return (
		<Fragment>
			<div>{count}</div>
			<button onClick={() => setCount(count + 1)}>count</button>
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
