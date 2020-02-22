import { createElement } from "preact";
import { getDisplayName } from "./util";

/**
 * @param {{ persons: import('./index').Person[]; selectedId: number; onChange: (e: Event) => void;}} props
 */
export function PersonSelect({ persons, selectedId, onChange }) {
	return (
		<div class="form-group">
			<label class="form-label">Select a person to edit:</label>
			<select size={5} onChange={onChange} class="form-select">
				{persons.map(person => {
					return (
						<option
							key={person.id}
							value={person.id}
							selected={person.id == selectedId}
						>
							{getDisplayName(person)}
						</option>
					);
				})}
			</select>
		</div>
	);
}
