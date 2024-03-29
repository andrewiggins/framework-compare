import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { c: "", f: "" };
	}

	setBothFromC(value) {
		this.setState({
			c: value,
			f: +(32 + (9 / 5) * value).toFixed(1)
		});
	}

	setBothFromF(value) {
		this.setState({
			f: value,
			c: +((5 / 9) * (value - 32)).toFixed(1)
		});
	}

	render() {
		return (
			<>
				<input
					value={this.state.c}
					onInput={e => this.setBothFromC(e.currentTarget.value)}
					type="number"
				/>{" "}
				°c ={" "}
				<input
					value={this.state.f}
					onInput={e => this.setBothFromF(e.currentTarget.value)}
					type="number"
				/>{" "}
				°f
			</>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
