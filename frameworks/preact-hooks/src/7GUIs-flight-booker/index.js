import { h, render, Fragment } from "preact";
import { useState } from "preact/hooks";

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

function App() {
	const [tripType, setTripType] = useState(oneWayFlight);
	const [departing, setDeparting] = useState(initial);
	const [returning, setReturning] = useState(initial);

	function bookFlight() {
		const type = tripType === returnFlight ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${departing.toDateString()}`;
		if (tripType == returnFlight) {
			message += ` and returning ${returning.toDateString()}`;
		}

		alert(message);
	}

	return (
		<Fragment>
			<div class="form-group">
				<label class="form-label" for="trip-type">
					Trip type
				</label>
				<select
					id="trip-type"
					class="form-select"
					value={tripType}
					onInput={e => setTripType(e.target.value)}
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
					value={convertToDateString(departing)}
					onInput={e => setDeparting(convertToDate(e.target.value))}
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
					value={convertToDateString(returning)}
					onInput={e => setReturning(convertToDate(e.target.value))}
					disabled={tripType !== returnFlight}
				/>
			</div>
			<div class="form-group">
				<button
					disabled={tripType == returnFlight && returning < departing}
					onClick={bookFlight}
					class="btn btn-primary"
				>
					book
				</button>
			</div>
		</Fragment>
	);
}

render(<App />, document.getElementById("app"));
