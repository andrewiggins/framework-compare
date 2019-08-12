import { createElement } from "preact";

export function DateEntry({
	label,
	date,
	setDate,
	errorMsg,
	disabled = false
}) {
	const inputId = `${label}-date`;
	return (
		<div class={"form-group" + (errorMsg ? " has-error" : "")}>
			<label class="form-label" for={inputId}>
				{label}
			</label>
			<input
				id={inputId}
				class="form-input"
				type="text"
				value={date}
				onInput={e => setDate(e.target.value)}
				disabled={disabled}
			/>
			{errorMsg && <p class="form-input-hint">{errorMsg}</p>}
		</div>
	);
}
