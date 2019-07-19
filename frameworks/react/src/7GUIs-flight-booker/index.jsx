import React from "react";
import ReactDOM from "react-dom";
import { today, validateDate } from "../../../../lib/date";

const initial = today();
const oneWayFlight = "one-way";
const returnFlight = "return";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tripType: oneWayFlight,
			departing: initial,
			departingError: null,
			returning: initial,
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

	render() {
		let {
			tripType,
			departing,
			departingError,
			returning,
			returningError
		} = this.state;

		if (
			departingError == null &&
			returningError == null &&
			tripType == returnFlight &&
			returning < departing
		) {
			returningError = "Returning date must be on or after departing date.";
		}

		const isBookDisabled = departingError || returningError;

		return (
			<>
				<div className="form-group">
					<label className="form-label" htmlFor="trip-type">
						Trip type
					</label>
					<select
						id="trip-type"
						className="form-select"
						value={tripType}
						onInput={e => this.setState({ tripType: e.target.value })}
					>
						<option value={oneWayFlight}>one-way flight</option>
						<option value={returnFlight}>return flight</option>
					</select>
				</div>
				<div className={"form-group" + (departingError ? " has-error" : "")}>
					<label className="form-label" htmlFor="departing-date">
						Departing
					</label>
					<input
						id="departing-date"
						className="form-input"
						type="text"
						value={departing}
						onInput={e => this.updateDate("departing", e.target.value)}
					/>
					{departingError && <p class="form-input-hint">{departingError}</p>}
				</div>
				<div className={"form-group" + (returningError ? " has-error" : "")}>
					<label className="form-label" htmlFor="returning-date">
						Returning
					</label>
					<input
						id="returning-date"
						className="form-input"
						type="text"
						value={returning}
						onInput={e => this.updateDate("returning", e.target.value)}
						disabled={tripType !== returnFlight}
					/>
					{returningError && <p class="form-input-hint">{returningError}</p>}
				</div>
				<div className="form-group">
					<button
						disabled={isBookDisabled}
						onClick={() => this.bookFlight()}
						className="btn btn-primary"
					>
						book
					</button>
				</div>
			</>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
