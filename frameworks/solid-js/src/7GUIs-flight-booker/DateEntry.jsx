/**
 * @typedef DateEntryProps
 * @property {string} label
 * @property {string} date
 * @property {(newDate: string) => void} setDate
 * @property {string | null} errorMsg
 * @property {boolean} [disabled]
 */

/**
 * @param {DateEntryProps} props
 */
export function DateEntry(props) {
	const inputId = `${props.label}-date`;
	return (
		<div class={"form-group" + (props.errorMsg ? " has-error" : "")}>
			<label class="form-label" for={inputId}>
				{props.label}
			</label>
			<input
				id={inputId}
				class="form-input"
				type="text"
				value={props.date}
				onInput={e => props.setDate(e.currentTarget.value)}
				disabled={props.disabled}
			/>
			{props.errorMsg && <p class="form-input-hint">{props.errorMsg}</p>}
		</div>
	);
}
