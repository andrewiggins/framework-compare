import { h, Component, Fragment, render } from "preact";

class App extends Component {
	constructor() {
		super();
		this.state = { value: 0 };
	}

	render(props, state) {
		return (
			<Fragment>
				<div>{state.value}</div>
				<button onClick={() => this.setState({ value: state.value + 1 })}>
					count
				</button>
			</Fragment>
		);
	}
}

render(<App />, document.getElementById("app"));
