import { html, render } from "lit-html";

const Timer = (elapsed, duration, setDuration, reset) => html`
	<label>
		Elapsed time: <progress value=${elapsed / duration}></progress
	></label>
	<div class="elapsed">${(elapsed / 1000).toFixed(1)}s</div>
	<label>
		Duration:
		<input
			type="range"
			min="1"
			max="20000"
			.value=${duration}
			@input=${setDuration}
		/>
	</label>
	<div>
		<button class="btn btn-primary" @click=${reset}>
			Reset
		</button>
	</div>
`;

const container = document.getElementById("app");

function update(elapsed, duration, last_time) {
	const reset = () => update(0, duration, performance.now());
	const setDuration = e => update(elapsed, e.target.value, last_time);

	if (elapsed < duration) {
		requestAnimationFrame(time =>
			update(
				elapsed + Math.min(time - last_time, duration - elapsed),
				duration,
				time
			)
		);
	}

	render(Timer(elapsed, duration, setDuration, reset), container);
}

update(0, 5000, performance.now());
