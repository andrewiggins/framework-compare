import React from "react";
import ReactDOM from "react-dom";
import { today, validateDate } from "../../../../lib/date";
import { TripType, oneWayFlight, returnFlight } from "./TripType";
import { DateEntry } from "./DateEntry";

const initial = today();

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
				<TripType
					tripType={tripType}
					setTripType={tripType => this.setState({ tripType })}
				/>
				<DateEntry
					label="Departing"
					date={departing}
					setDate={newDate => this.updateDate("departing", newDate)}
					errorMsg={departingError}
				/>
				<DateEntry
					label="Returning"
					date={returning}
					setDate={newDate => this.updateDate("returning", newDate)}
					errorMsg={returningError}
					disabled={tripType !== returnFlight}
				/>
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
