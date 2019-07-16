import { createElement, render, Fragment, Component } from "preact";

class App extends Component {
	constructor() {
		super();
		this.state = {
			elapsed: 0,
			duration: 5000,
			lastRenderTime: performance.now()
		};

		this.frame = null;
		this.animationFrame = this.animationFrame.bind(this);
	}

	animationFrame() {
		const now = performance.now();
		const timeToAdd = Math.min(
			now - this.state.lastRenderTime,
			this.state.duration - this.state.elapsed
		);

		this.frame = null;
		this.setState({
			elapsed: this.state.elapsed + timeToAdd,
			lastRenderTime: now
		});
	}

	componentDidMount() {
		this.frame = requestAnimationFrame(this.animationFrame);
	}

	componentDidUpdate() {
		if (this.state.elapsed < this.state.duration && this.frame == null) {
			this.frame = requestAnimationFrame(this.animationFrame);
		}
	}

	componentWillUnmount() {
		cancelAnimationFrame(this.frame);
	}

	render(props, state) {
		return (
			<Fragment>
				<label>
					Elapsed time: <progress value={state.elapsed / state.duration} />
				</label>
				<div class="elapsed">{(state.elapsed / 1000).toFixed(1)}s</div>
				<label>
					Duration:{" "}
					<input
						type="range"
						min="1"
						max="20000"
						value={state.duration}
						onInput={e => this.setState({ duration: e.target.value })}
					/>
				</label>
				<div>
					<button
						class="btn btn-primary"
						onClick={() => {
							this.setState({
								elapsed: 0,
								lastRenderTime: performance.now()
							});
						}}
					>
						Reset
					</button>
				</div>
			</Fragment>
		);
	}
}

render(<App />, document.getElementById("app"));
