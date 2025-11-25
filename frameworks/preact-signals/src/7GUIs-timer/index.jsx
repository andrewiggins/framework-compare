import { signal, computed, effect } from "@preact/signals";
import { render } from "preact";
import {
	action,
	createModel,
	useModel
} from "../../../../lib/model/createModel.js";

const TimerModel = createModel(() => {
	const elapsed = signal(0);
	const duration = signal(5000);
	const lastRenderTime = signal(performance.now());
	const frame = signal(null);

	const progress = computed(() => elapsed.value / duration.value);
	const elapsedLabel = computed(() => (elapsed.value / 1000).toFixed(1));

	const setDuration = value => {
		duration.value = value;
	};

	const reset = () => {
		elapsed.value = 0;
		lastRenderTime.value = performance.now();
	};

	/** @type {(now: number) => void} */
	const advanceTime = action(now => {
		frame.value = null;
		const timeToAdd = Math.min(
			now - lastRenderTime.value,
			duration.value - elapsed.value
		);
		elapsed.value += timeToAdd;
		lastRenderTime.value = now;
	});

	effect(() => {
		// Hmm being reactive to a signal you also write to maybe is an
		// anti-pattern? Particularly if your cleanup also writes to it?
		if (frame.peek() == null && elapsed.value < duration.value) {
			frame.value = requestAnimationFrame(advanceTime);
		}
		return () => {
			if (frame.value) {
				cancelAnimationFrame(frame.value);
				frame.value = null;
			}
		};
	});

	return {
		elapsed,
		duration,
		progress,
		elapsedLabel,
		setDuration,
		reset
	};
});

function App() {
	const { duration, progress, elapsedLabel, setDuration, reset } =
		useModel(TimerModel);

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
