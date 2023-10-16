import { render, Component } from "preact";
import { today, validateDate } from "../../../../lib/date";
import { TripType, oneWayFlight, returnFlight } from "./TripType";
import { DateEntry } from "./DateEntry";

const initialDate = today();

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

		let message = `You have booked a ${type} flight, departing ${this.state.departing}`;
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
			<>
				<TripType
					tripType={state.tripType}
					setTripType={tripType => this.setState({ tripType })}
				/>
				<DateEntry
					label="Departing"
					date={state.departing}
					setDate={newDate => this.updateDate("departing", newDate)}
					errorMsg={state.departingError}
				/>
				<DateEntry
					label="Returning"
					date={state.returning}
					setDate={newDate => this.updateDate("returning", newDate)}
					errorMsg={returningError}
					disabled={state.tripType !== returnFlight}
				/>
				<div class="form-group">
					<button
						disabled={isBookDisabled}
						onClick={() => this.bookFlight()}
						class="btn btn-primary"
					>
						book
					</button>
				</div>
			</>
		);
	}
}

render(<App />, document.getElementById("app"));
