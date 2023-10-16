import { createElement } from "preact";

export const oneWayFlight = "one-way";
export const returnFlight = "return";

export function TripType({ tripType, setTripType }) {
	return (
		<div class="form-group">
			<label class="form-label" for="trip-type">
				Trip type
			</label>
			<select
				id="trip-type"
				class="form-select"
				value={tripType}
				onInput={e => setTripType(e.currentTarget.value)}
			>
				<option value={oneWayFlight}>one-way flight</option>
				<option value={returnFlight}>return flight</option>
			</select>
		</div>
	);
}
