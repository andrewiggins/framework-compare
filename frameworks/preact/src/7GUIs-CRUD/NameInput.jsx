import { createElement } from "preact";

/**
 * @param {{ id: string; value: string; onInput: preact.JSX.GenericEventHandler<HTMLInputElement>; label: string; required?: boolean; }} props
 */
export function NameInput({ id, value, onInput, label, required = false }) {
	// TODO: Show error message if required == true but value == ""
	return (
		<div class="form-group">
			<label for={id} class="form-label">
				{label}{" "}
			</label>
			<input
				id={id}
				class="form-input"
				type="text"
				value={value}
				onInput={onInput}
				required={required}
			/>
		</div>
	);
}
