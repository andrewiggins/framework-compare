import { createMemo, createSignal } from "solid-js";
import { render } from "solid-js/web";
import { today, validateDate } from "../../../../lib/date";
import { TripType, RETURN_FLIGHT, ONE_WAY_FLIGHT } from "./TripType";
import { DateEntry } from "./DateEntry";

const initialDate = today();

/**
 * @typedef {import('solid-js').Accessor<T>} Accessor
 * @template T
 */

/**
 * @param {string} initialDate
 * @returns {[Accessor<string>, Accessor<string | null>, (string) => void]}
 */
function useDate(initialDate) {
	const [date, setDate] = createSignal(initialDate);
	const [error, setError] = createSignal(null);

	/** @type {(newDate: string) => void} */
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
	const [tripType, setTripType] = createSignal(ONE_WAY_FLIGHT);
	const [departing, departingError, setDeparting] = useDate(initialDate);
	const [returning, returningError, setReturning] = useDate(initialDate);

	const finalReturningError = createMemo(() => {
		if (
			departingError() == null &&
			returningError() == null &&
			tripType() == RETURN_FLIGHT &&
			returning() < departing()
		) {
			return "Returning date must be on or after departing date.";
		} else {
			return returningError();
		}
	});

	function bookFlight() {
		const type = tripType() === RETURN_FLIGHT ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${departing()}`;
		if (tripType() == RETURN_FLIGHT) {
			message += ` and returning ${returning()}`;
		}

		alert(message);
	}

	return (
		<>
			<TripType
				tripType={tripType()}
				setTripType={value => setTripType(value)}
			/>
			<DateEntry
				label="Departing"
				date={departing()}
				setDate={newDate => setDeparting(newDate)}
				errorMsg={departingError()}
			/>
			<DateEntry
				label="Returning"
				date={returning()}
				setDate={newDate => setReturning(newDate)}
				errorMsg={finalReturningError()}
				disabled={tripType() !== RETURN_FLIGHT}
			/>
			<div class="form-group">
				<button
					disabled={Boolean(departingError() || finalReturningError())}
					onClick={bookFlight}
					class="btn btn-primary"
				>
					book
				</button>
			</div>
		</>
	);
}

render(App, document.getElementById("app"));
