import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";
import { today, validateDate } from "../../../../lib/date";

const initialDate = today();
const oneWayFlight = "one-way";
const returnFlight = "return";

function useDate(initialDate) {
	const [date, setDate] = useState(initialDate);
	const [error, setError] = useState(null);

	function updateDate(newDate) {
		setDate(newDate);

		try {
			validateDate(newDate);
			setError(null);
		} catch (error) {
			setError(error.message);
		}
	}

	return [date, error, updateDate];
}

function App() {
	const [tripType, setTripType] = useState(oneWayFlight);
	const [departing, departingError, setDeparting] = useDate(initialDate);
	let [returning, returningError, setReturning] = useDate(initialDate);

	if (
		departingError == null &&
		returningError == null &&
		tripType == returnFlight &&
		returning < departing
	) {
		returningError = "Returning date must be on or after departing date.";
	}

	const isBookDisabled =
		departingError ||
		returningError ||
		(tripType == returnFlight && returning < departing);

	function bookFlight() {
		const type = tripType === returnFlight ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${departing}`;
		if (tripType == returnFlight) {
			message += ` and returning ${returning}`;
		}

		alert(message);
	}

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
					onInput={e => setTripType(e.target.value)}
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
					onInput={e => setDeparting(e.target.value)}
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
					onInput={e => setReturning(e.target.value)}
					disabled={tripType !== returnFlight}
				/>
				{returningError && <p class="form-input-hint">{returningError}</p>}
			</div>
			<div className="form-group">
				<button
					disabled={isBookDisabled}
					onClick={bookFlight}
					className="btn btn-primary"
				>
					book
				</button>
			</div>
		</>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
