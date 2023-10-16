import React, {
	useEffect,
	useLayoutEffect,
	useState,
	useRef,
	Fragment
} from "react";
import ReactDOM from "react-dom";

function App() {
	const [lastRenderTime, setLastRenderTime] = useState(performance.now());
	const [elapsed, setElapsed] = useState(0);
	const [duration, setDuration] = useState(5000);
	const frame = useRef(null);

	useLayoutEffect(() => {
		if (frame.current == null && elapsed < duration) {
			frame.current = requestAnimationFrame(now => {
				frame.current = null;
				const timeToAdd = Math.min(now - lastRenderTime, duration - elapsed);
				setElapsed(prevElapsed => prevElapsed + timeToAdd);
				setLastRenderTime(now);
			});

			return () => {
				if (frame.current) {
					frame.current = cancelAnimationFrame(frame.current);
				}
			};
		}
	}, [elapsed, duration, lastRenderTime]);

	return (
		<>
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
					onChange={e => setDuration(e.currentTarget.valueAsNumber)}
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
		</>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
