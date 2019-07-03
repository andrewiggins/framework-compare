import { h, Component, Fragment, render } from "preact";

class App extends Component {
	constructor() {
		super();
		this.state = { value: 0 };
	}

	render(props, state) {
		return (
			<Fragment>
				<input type="number" value={state.value} />
				<button onClick={() => this.setState({ value: state.value + 1 })}>
					count
				</button>
			</Fragment>
		);
	}
}

render(<App />, document.getElementById("app"));
