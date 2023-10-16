import { createSignal } from "solid-js";
import { render } from "solid-js/web";

function App() {
	const [count, setCount] = createSignal(0);
	return (
		<button
			class="btn badge"
			data-badge={count()}
			style={{ "margin-top": "0.5rem" }}
			onClick={() => setCount(count() + 1)}
		>
			count: {count()}
		</button>
	);
}

render(App, document.getElementById("app"));
