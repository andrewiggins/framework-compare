import { html, render } from "lit-html";
import { today, validateDate } from "../../../../lib/date";

const oneWayFlight = "one-way";
const returnFlight = "return";

const Error = errorMessage => html`
	<p class="form-input-hint">${errorMessage}</p>
`;

const FlightBooker = (
	tripType,
	setTripType,

	departing,
	departingError,
	setDeparting,

	returning,
	returningError,
	setReturning,

	isBookDisabled,
	bookFlight
) => html`
	<div class="form-group">
		<label class="form-label" for="trip-type">Trip type</label
		><select
			id="trip-type"
			class="form-select"
			value=${tripType}
			@input=${setTripType}
		>
			<option value=${oneWayFlight}>one-way flight</option>
			<option value=${returnFlight}>return flight</option>
		</select>
	</div>
	<div class=${"form-group" + (departingError ? " has-error" : "")}>
		<label class="form-label" for="departing-date">Departing</label
		><input
			id="departing-date"
			class="form-input"
			type="text"
			value=${departing}
			@input=${setDeparting}
		/>
		${departingError && Error(departingError)}
	</div>
	<div class=${"form-group" + (returningError ? " has-error" : "")}>
		<label class="form-label" for="returning-date">Returning</label
		><input
			id="returning-date"
			class="form-input"
			type="text"
			value=${returning}
			@input=${setReturning}
			?disabled=${tripType !== returnFlight}
		/>
		${returningError && Error(returningError)}
	</div>
	<div class="form-group">
		<button
			?disabled=${isBookDisabled}
			@click=${bookFlight}
			class="btn btn-primary"
		>
			book
		</button>
	</div>
`;

function getErrorMessage(date) {
	try {
		validateDate(date);
		return null;
	} catch (error) {
		return error.message;
	}
}

const container = document.getElementById("app");
function update(tripType, departing, returning) {
	let departingError = getErrorMessage(departing);
	let returningError = getErrorMessage(returning);
	if (
		departingError == null &&
		returningError == null &&
		tripType == returnFlight &&
		returning < departing
	) {
		returningError = "Returning date must be on or after departing date.";
	}

	const isBookDisabled = departingError || returningError;

	const setTripType = e => update(e.target.value, departing, returning);
	const setDeparting = e => update(tripType, e.target.value, returning);
	const setReturning = e => update(tripType, departing, e.target.value);

	function bookFlight() {
		const type = tripType === returnFlight ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${departing}`;
		if (tripType == returnFlight) {
			message += ` and returning ${returning}`;
		}

		alert(message);
	}

	render(
		FlightBooker(
			tripType,
			setTripType,

			departing,
			departingError,
			setDeparting,

			returning,
			returningError,
			setReturning,

			isBookDisabled,
			bookFlight
		),
		container
	);
}

const initialDate = today();
update(oneWayFlight, initialDate, initialDate);
