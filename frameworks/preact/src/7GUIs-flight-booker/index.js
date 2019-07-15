import { h, render, Fragment, Component } from "preact";

const initial = new Date();
const oneWayFlight = "one-way";
const returnFlight = "return";

function convertToDate(str) {
	const split = str.split("-");
	return new Date(+split[0], +split[1] - 1, +split[2]);
}

function convertToDateString(fullDate) {
	let month = fullDate.getMonth() + 1;
	let date = fullDate.getDate();
	return [
		fullDate.getFullYear(),
		month < 10 ? "0" + month : month,
		date < 10 ? "0" + date : date
	].join("-");
}

class App extends Component {
	constructor() {
		super();
		this.state = {
			tripType: oneWayFlight,
			departing: initial,
			returning: initial
		};
	}

	bookFlight() {
		const type = this.state.tripType === returnFlight ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${this.state.departing.toDateString()}`;
		if (this.state.tripType == returnFlight) {
			message += ` and returning ${this.state.returning.toDateString()}`;
		}

		alert(message);
	}

	render(props, state) {
		return (
			<Fragment>
				<div class="form-group">
					<label class="form-label" for="trip-type">
						Trip type
					</label>
					<select
						id="trip-type"
						class="form-select"
						value={state.tripType}
						onInput={e => this.setState({ tripType: e.target.value })}
					>
						<option value={oneWayFlight}>one-way flight</option>
						<option value={returnFlight}>return flight</option>
					</select>
				</div>
				<div class="form-group">
					<label class="form-label" for="departing-date">
						Departing
					</label>
					<input
						id="departing-date"
						class="form-input"
						type="date"
						value={convertToDateString(state.departing)}
						onInput={e =>
							this.setState({ departing: convertToDate(e.target.value) })
						}
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="returning-date">
						Returning
					</label>
					<input
						id="returning-date"
						class="form-input"
						type="date"
						value={convertToDateString(state.returning)}
						onInput={e =>
							this.setState({ returning: convertToDate(e.target.value) })
						}
						disabled={state.tripType !== returnFlight}
					/>
				</div>
				<div class="form-group">
					<button
						disabled={
							state.tripType == returnFlight &&
							state.returning < state.departing
						}
						onClick={() => this.bookFlight()}
						class="btn btn-primary"
					>
						book
					</button>
				</div>
			</Fragment>
		);
	}
}

render(<App />, document.getElementById("app"));
