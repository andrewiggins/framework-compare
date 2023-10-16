import { html, render } from "lit";
import { today, validateDate } from "../../../../lib/date";
import { DateEntry } from "./DateEntry";
import { TripType, returnFlight, oneWayFlight } from "./TripType";

/**
 * @typedef {(e: Event) => void} EventHandler
 *
 * @param {string} tripType
 * @param {EventHandler} setTripType
 * @param {string} departing
 * @param {string} departingError
 * @param {EventHandler} setDeparting
 * @param {string} returning
 * @param {string} returningError
 * @param {EventHandler} setReturning
 * @param {boolean} isBookDisabled
 * @param {EventHandler} bookFlight
 */
function FlightBooker(
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
) {
	return html`
		${TripType(tripType, setTripType)}
		${DateEntry("Departing", departing, departingError, setDeparting)}
		${DateEntry(
			"Returning",
			returning,
			returningError,
			setReturning,
			tripType !== returnFlight
		)}
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
}

/**
 * @param {string} date
 * @returns {string | null}
 */
function getErrorMessage(date) {
	try {
		validateDate(date);
		return null;
	} catch (error) {
		return error.message;
	}
}

const container = document.getElementById("app");

/**
 * @param {string} tripType
 * @param {string} departing
 * @param {string} returning
 */
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

	const isBookDisabled = Boolean(departingError || returningError);

	const setTripType = newTripType => update(newTripType, departing, returning);
	const setDeparting = newDate => update(tripType, newDate, returning);
	const setReturning = newDate => update(tripType, departing, newDate);

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
