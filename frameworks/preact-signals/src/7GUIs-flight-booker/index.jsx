import { render } from "preact";
import { today, validateDate } from "../../../../lib/date";
import { createModel, useModel } from "../../../../lib/model/createModel.js";
import { TripType, returnFlight, oneWayFlight } from "./TripType";
import { DateEntry } from "./DateEntry";
import { computed, signal } from "@preact/signals";

const initialDate = today();

const DateModel = createModel(() => {
	const date = signal(initialDate);
	const error = signal(null);

	const setDate = newDate => {
		date.value = newDate;

		try {
			validateDate(newDate);
			error.value = null;
		} catch (e) {
			error.value = e.message;
		}
	};

	return {
		date,
		error,
		setDate
	};
});

const FlightBookerModel = createModel(() => {
	const tripType = signal(oneWayFlight);
	const departing = new DateModel();
	const returning = new DateModel();

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

	const isBookDisabled = computed(() => {
		return Boolean(departing.error.value || returningError.value);
	});

	const isReturnDisabled = computed(() => tripType.value !== returnFlight);

	const setTripType = value => {
		tripType.value = value;
	};

	const bookFlight = () => {
		const type = tripType.value === returnFlight ? "return" : "one-way";

		let message = `You have booked a ${type} flight, departing ${departing.date.value}`;
		if (tripType.value == returnFlight) {
			message += ` and returning ${returning.date.value}`;
		}

		alert(message);
	};

	return {
		tripType,
		departing: departing.date,
		departingError: departing.error,
		returning: returning.date,
		returningError,
		isBookDisabled,
		isReturnDisabled,
		setTripType,
		setDeparting: departing.setDate,
		setReturning: returning.setDate,
		bookFlight
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
	} = useModel(FlightBookerModel);

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
