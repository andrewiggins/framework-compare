import { h, Component, Fragment, render } from "preact";

class App extends Component {
	constructor() {
		super();
		this.state = { value: 0 };
	}

	render(props, state) {
		return (
			<Fragment>
				<button
					class="btn badge"
					data-badge={state.value}
					style="margin-top: .5rem"
					onClick={() => this.setState({ value: state.value + 1 })}
				>
					count: {state.value}
				</button>
			</Fragment>
		);
	}
}

render(<App />, document.getElementById("app"));
