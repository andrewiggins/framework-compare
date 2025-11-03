import { signal, computed, effect } from "@preact/signals";
import { render } from "preact";
import {
	action,
	createModelFactory,
	useModel
} from "../../../../lib/createModelFactory";

const createTimerModel = createModelFactory(() => {
	const elapsed = signal(0);
	const duration = signal(5000);
	const lastRenderTime = signal(performance.now());
	const frame = signal(null);

	const progress = computed(() => elapsed.value / duration.value);
	const elapsedLabel = computed(() => (elapsed.value / 1000).toFixed(1));

	const setDuration = action(value => {
		duration.value = value;
	});

	const reset = action(() => {
		elapsed.value = 0;
		lastRenderTime.value = performance.now();
	});

	const advanceFrame = action(now => {
		frame.value = null;
		const timeToAdd = Math.min(
			now - lastRenderTime.value,
			duration.value - elapsed.value
		);
		elapsed.value += timeToAdd;
		lastRenderTime.value = now;
	});

	return {
		views: { elapsed, duration, progress, elapsedLabel },
		actions: { setDuration, reset },
		effects: {
			tick: effect(() => {
				if (frame.value == null && elapsed.value < duration.value) {
					frame.value = requestAnimationFrame(advanceFrame);
				}

				// TODO: What are the rules for cleanup here? Is effect the tool for this?
				return () => {
					if (frame.value) {
						// cancelAnimationFrame(frame.value);
						// frame.value = null;
					}
				};
			})
		}
	};
});

function App() {
	const { duration, progress, elapsedLabel, setDuration, reset } =
		useModel(createTimerModel);

	return (
		<>
			<label>
				Elapsed time: <progress value={progress} />
			</label>
			<div class="elapsed">{elapsedLabel}s</div>
			<label>
				Duration:{" "}
				<input
					type="range"
					min="1"
					max="20000"
					value={duration}
					onInput={e => setDuration(e.currentTarget.valueAsNumber)}
				/>
			</label>
			<div>
				<button class="btn btn-primary" onClick={() => reset()}>
					Reset
				</button>
			</div>
		</>
	);
}

render(<App />, document.getElementById("app"));
