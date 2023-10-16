export const ONE_WAY_FLIGHT = "one-way";
export const RETURN_FLIGHT = "return";

/**
 * @param {{ tripType: string; setTripType(value: string): void; }} props
 */
export function TripType(props) {
	return (
		<div class="form-group">
			<label class="form-label" for="trip-type">
				Trip type
			</label>
			<select
				id="trip-type"
				class="form-select"
				value={props.tripType}
				onInput={e => props.setTripType(e.currentTarget.value)}
			>
				<option value={ONE_WAY_FLIGHT}>one-way flight</option>
				<option value={RETURN_FLIGHT}>return flight</option>
			</select>
		</div>
	);
}
