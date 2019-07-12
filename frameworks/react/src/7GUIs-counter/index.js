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
				<button
					className="btn badge"
					data-badge={this.state.value}
					style={{ marginTop: ".5rem" }}
					onClick={() => this.setState({ value: this.state.value + 1 })}
				>
					count: {this.state.value}
				</button>
			</>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
