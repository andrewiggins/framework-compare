import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
	constructor(props) {
		super(props);
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
		this.setState({
			elapsed: this.state.elapsed + timeToAdd,
			lastRenderTime: now
		});
		this.frame = null;
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

	render() {
		return (
			<>
				<label>
					Elapsed time: <progress value={this.state.elapsed / this.state.duration} />
				</label>
				<div>{(this.state.elapsed / 1000).toFixed(1)}s</div>
				<label>
					Duration:{" "}
					<input
						type="range"
						min="1"
						max="20000"
						value={this.state.duration}
						onInput={e => this.setState({ duration: e.target.value })}
					/>
				</label>
				<div>
					<button
						className="btn btn-primary"
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
			</>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
