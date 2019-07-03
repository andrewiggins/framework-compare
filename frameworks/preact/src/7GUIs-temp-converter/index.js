import { h, render, Fragment, Component } from "preact";

class App extends Component {
	constructor() {
		super();
		this.state = { c: null, f: null };
	}

	setBothFromC(value) {
		this.setState({
			c: +value,
			f: +(32 + (9 / 5) * value).toFixed(1)
		});
	}

	setBothFromF(value) {
		this.setState({
			f: +value,
			c: +((5 / 9) * (value - 32)).toFixed(1)
		});
	}

	render(props, state) {
		return (
			<Fragment>
				<input
					value={state.c}
					onInput={e => this.setBothFromC(e.target.value)}
					type="number"
				/>{" "}
				°c ={" "}
				<input
					value={state.f}
					onInput={e => this.setBothFromF(e.target.value)}
					type="number"
				/>{" "}
				°f
			</Fragment>
		);
	}
}

render(<App />, document.getElementById("app"));
