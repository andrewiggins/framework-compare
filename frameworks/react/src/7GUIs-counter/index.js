import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { value: 0 };
	}

	render() {
		return (
			<>
				<input type="number" value={this.state.value} />
				<button onClick={() => this.setState({ value: this.state.value + 1 })}>
					count
				</button>
			</>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
