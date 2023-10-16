import {
	createSignal,
	onMount,
	onCleanup,
	createMemo,
	createRenderEffect
} from "solid-js";
import { render } from "solid-js/web";

function App() {
	const [lastRenderTime, setLastRenderTime] = createSignal(performance.now());
	const [elapsed, setElapsed] = createSignal(0);
	const [duration, setDuration] = createSignal(5000);
	const formattedElapsed = createMemo(() => (elapsed() / 1000).toFixed(1));

	/** @type {number | null} */
	let frame = null;
	function requestFrame() {
		// Always access signals first so Solid can track the dependencies,
		// regardless of if the frame is null or not.
		if (elapsed() < duration() && frame == null) {
			frame = requestAnimationFrame(now => {
				frame = null;
				const timeToAdd = Math.min(
					now - lastRenderTime(),
					duration() - elapsed()
				);
				setElapsed(prevElapsed => prevElapsed + timeToAdd);
				setLastRenderTime(now);
			});
		}
	}

	createRenderEffect(() => requestFrame());

	onCleanup(() => {
		if (frame != null) {
			cancelAnimationFrame(frame);
		}
	});

	return (
		<>
			<label>
				Elapsed time: <progress value={elapsed() / duration()} />
			</label>
			<div class="elapsed">{formattedElapsed()}s</div>
			<label>
				Duration:{" "}
				<input
					type="range"
					min="1"
					max="20000"
					value={duration()}
					onInput={e => setDuration(e.currentTarget.valueAsNumber)}
				/>
			</label>
			<div>
				<button
					class="btn btn-primary"
					onClick={() => {
						setElapsed(0);
						setLastRenderTime(performance.now());
					}}
				>
					Reset
				</button>
			</div>
		</>
	);
}

render(App, document.getElementById("app"));
