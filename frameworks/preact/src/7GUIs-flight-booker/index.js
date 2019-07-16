import { h, render, Fragment, Component } from "preact";
import { today, validateDate } from "../../../../lib/date";

const initialDate = today();
const oneWayFlight = "one-way";
const returnFlight = "return";

class App extends Component {
	constructor() {
		super();
		this.state = {
			tripType: oneWayFlight,
			departing: initialDate,
			departingError: null,
			returning: initialDate,
			returningError: null
		};
	}

	updateDate(dateType, newDate) {
		let errorMsg = null;
		try {
			validateDate(newDate);
		} catch (error) {
			errorMsg = error.message;
		}

		this.setState({
			[dateType]: newDate,
			[dateType + "Error"]: errorMsg
		});
	}

	bookFlight() {
		const type = this.state.tripType === returnFlight ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${
			this.state.departing
		}`;
		if (this.state.tripType == returnFlight) {
			message += ` and returning ${this.state.returning}`;
		}

		alert(message);
	}

	render(props, state) {
		let returningError = state.returningError;
		if (
			state.departingError == null &&
			returningError == null &&
			state.tripType == returnFlight &&
			state.returning < state.departing
		) {
			returningError = "Returning date must be on or after departing date.";
		}

		const isBookDisabled = state.departingError || returningError;

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
				<div class={"form-group" + (state.departingError ? " has-error" : "")}>
					<label class="form-label" for="departing-date">
						Departing
					</label>
					<input
						id="departing-date"
						class="form-input"
						type="text"
						value={state.departing}
						onInput={e => this.updateDate("departing", e.target.value)}
					/>
					{state.departingError && (
						<p class="form-input-hint">{state.departingError}</p>
					)}
				</div>
				<div class={"form-group" + (returningError ? " has-error" : "")}>
					<label class="form-label" for="returning-date">
						Returning
					</label>
					<input
						id="returning-date"
						class="form-input"
						type="text"
						value={state.returning}
						onInput={e => this.updateDate("returning", e.target.value)}
						disabled={state.tripType !== returnFlight}
					/>
					{returningError && <p class="form-input-hint">{returningError}</p>}
				</div>
				<div class="form-group">
					<button
						disabled={isBookDisabled}
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
