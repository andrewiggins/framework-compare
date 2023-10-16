export function DateEntry({
	label,
	date,
	errorMsg,
	setDate,
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
				onInput={e => setDate(e.currentTarget.value)}
				disabled={disabled}
			/>
			{errorMsg && <p class="form-input-hint">{errorMsg}</p>}
		</div>
	);
}
