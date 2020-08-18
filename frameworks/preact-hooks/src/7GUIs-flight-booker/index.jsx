import { createElement, render, Fragment } from "preact";
import { useState } from "preact/hooks";
import { today, validateDate } from "../../../../lib/date";
import { TripType, returnFlight, oneWayFlight } from "./TripType";
import { DateEntry } from "./DateEntry";

const initialDate = today();

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

	const isBookDisabled = departingError || returningError;

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
			<TripType tripType={tripType} setTripType={value => setTripType(value)} />
			<DateEntry
				label="Departing"
				date={departing}
				setDate={newDate => setDeparting(newDate)}
				errorMsg={departingError}
			/>
			<DateEntry
				label="Returning"
				date={returning}
				setDate={newDate => setReturning(newDate)}
				errorMsg={returningError}
				disabled={tripType !== returnFlight}
			/>
			<div class="form-group">
				<button
					disabled={isBookDisabled}
					onClick={bookFlight}
					class="btn btn-primary"
				>
					book
				</button>
			</div>
		</>
	);
}

render(<App />, document.getElementById("app"));
