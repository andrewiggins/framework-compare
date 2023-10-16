export const oneWayFlight = "one-way";
export const returnFlight = "return";

export function TripType({ tripType, setTripType }) {
	return (
		<div className="form-group">
			<label className="form-label" htmlFor="trip-type">
				Trip type
			</label>
			<select
				id="trip-type"
				className="form-select"
				value={tripType}
				onChange={e => setTripType(e.target.value)}
			>
				<option value={oneWayFlight}>one-way flight</option>
				<option value={returnFlight}>return flight</option>
			</select>
		</div>
	);
}
