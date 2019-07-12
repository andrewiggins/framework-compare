import { h, Fragment, render } from "preact";
import { useState } from "preact/hooks";

function App() {
	const [count, setCount] = useState(0);
	return (
		<Fragment>
			<button
				class="btn badge"
				data-badge={count}
				style="margin-top: .5rem"
				onClick={() => setCount(count + 1)}
			>
				count: {count}
			</button>
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
