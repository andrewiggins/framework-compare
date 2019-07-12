import React, { useEffect, useState, Fragment } from "react";
import ReactDOM from "react-dom";

function App() {
	const [lastRenderTime, setLastRenderTime] = useState(performance.now());
	const [elapsed, setElapsed] = useState(0);
	const [duration, setDuration] = useState(5000);

	useEffect(() => {
		if (elapsed < duration) {
			const now = performance.now();
			const timeToAdd = Math.min(now - lastRenderTime, duration - elapsed);
			setElapsed(prevElapsed => prevElapsed + timeToAdd);
			setLastRenderTime(now);
		}
	}, [elapsed, duration, lastRenderTime]);

	return (
		<Fragment>
			<label>
				Elapsed time: <progress value={elapsed / duration} />
			</label>
			<div className="elapsed">{(elapsed / 1000).toFixed(1)}s</div>
			<label>
				Duration:{" "}
				<input
					type="range"
					min="1"
					max="20000"
					value={duration}
					onInput={e => setDuration(e.target.value)}
				/>
			</label>
			<div>
				<button
					className="btn btn-primary"
					onClick={() => {
						setElapsed(0);
						setLastRenderTime(performance.now());
					}}
				>
					Reset
				</button>
			</div>
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
