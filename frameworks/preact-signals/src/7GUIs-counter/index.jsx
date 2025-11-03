import { signal } from "@preact/signals";
import { render } from "preact";
import {
	action,
	createModelFactory,
	useModel
} from "../../../../lib/createModelFactory";

const createCounter = createModelFactory(() => {
	const count = signal(0);
	const increment = action(() => {
		count.value += 1;
	});

	return {
		state: { count },
		actions: { increment }
	};
});

function App() {
	const model = useModel(() => createCounter());

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
