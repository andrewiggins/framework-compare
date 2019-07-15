import React, { useState, Fragment } from "react";
import ReactDOM from "react-dom";

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
			<div className="form-group">
				<label className="form-label" htmlFor="departing-date">
					Departing
				</label>
				<input
					id="departing-date"
					className="form-input"
					type="date"
					value={convertToDateString(departing)}
					onInput={e => setDeparting(convertToDate(e.target.value))}
				/>
			</div>
			<div className="form-group">
				<label className="form-label" htmlFor="returning-date">
					Returning
				</label>
				<input
					id="returning-date"
					className="form-input"
					type="date"
					value={convertToDateString(returning)}
					onInput={e => setReturning(convertToDate(e.target.value))}
					disabled={tripType !== returnFlight}
				/>
			</div>
			<div className="form-group">
				<button
					disabled={tripType == returnFlight && returning < departing}
					onClick={bookFlight}
					className="btn btn-primary"
				>
					book
				</button>
			</div>
		</Fragment>
	);
}

ReactDOM.render(<App />, document.getElementById("app"));
