import { signal } from "@preact/signals";
import { render } from "preact";
import { createModel, useModel } from "../../../../lib/model/createModel.js";

const Counter = createModel(() => {
	const count = signal(0);
	const increment = () => {
		count.value += 1;
	};

	return {
		count,
		increment
	};
});

function App() {
	const model = useModel(Counter);

	return (
		<button
			class="btn badge"
			data-badge={model.count}
			style="margin-top: .5rem"
			onClick={() => model.increment()}
		>
			count: {model.count}
		</button>
	);
}

render(<App />, document.getElementById("app"));
