import { render } from "preact";
import { today, validateDate } from "../../../../lib/date";
import {
	action,
	createModelFactory,
	useModel
} from "../../../../lib/createModelFactory";
import { TripType, returnFlight, oneWayFlight } from "./TripType";
import { DateEntry } from "./DateEntry";
import { computed, signal } from "@preact/signals";

/** @import { Action } from "../../../../lib/createModelFactory" */

const initialDate = today();

const createDateModel = createModelFactory(() => {
	const date = signal(initialDate);
	const error = signal(null);

	const setDate = action(newDate => {
		date.value = newDate;

		try {
			validateDate(newDate);
			error.value = null;
		} catch (e) {
			error.value = e.message;
		}
	});

	return {
		views: { date, error },
		actions: { setDate }
	};
});

const createFlightBookerModel = createModelFactory(() => {
	const tripType = signal(oneWayFlight);
	const departing = createDateModel();
	const returning = createDateModel();

	const returningError = computed(() => {
		if (returning.error.value != null) {
			return returning.error.value;
		}

		if (
			departing.error.value == null &&
			tripType.value == returnFlight &&
			returning.date.value < departing.date.value
		) {
			return "Returning date must be on or after departing date.";
		}
	});

	return {
		views: {
			tripType,
			departing: departing.date,
			departingError: departing.error,
			returning: returning.date,
			returningError,
			isBookDisabled: computed(() => {
				return Boolean(departing.error.value || returningError.value);
			}),
			isReturnDisabled: computed(() => tripType.value !== returnFlight)
		},
		actions: {
			/** @type {Action<[string], void>} */
			setTripType: action(value => {
				tripType.value = value;
			}),
			setDeparting: departing.setDate,
			setReturning: returning.setDate,
			bookFlight: action(() => {
				const type = tripType.value === returnFlight ? "return" : "one-way";

				let message = `You have booked a ${type} flight, departing ${departing.date.value}`;
				if (tripType.value == returnFlight) {
					message += ` and returning ${returning.date.value}`;
				}

				alert(message);
			})
		}
	};
});

function App() {
	const {
		tripType,
		departing,
		departingError,
		returning,
		returningError,
		isBookDisabled,
		isReturnDisabled,
		setTripType,
		setDeparting,
		setReturning,
		bookFlight
	} = useModel(() => createFlightBookerModel());

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
				disabled={isReturnDisabled}
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
