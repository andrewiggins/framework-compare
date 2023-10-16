export function DateEntry({
	label,
	date,
	errorMsg,
	setDate,
	disabled = false
}) {
	const inputId = `${label}-date`;
	return (
		<div className={"form-group" + (errorMsg ? " has-error" : "")}>
			<label className="form-label" htmlFor={inputId}>
				{label}
			</label>
			<input
				id={inputId}
				className="form-input"
				type="text"
				value={date}
				onChange={e => setDate(e.target.value)}
				disabled={disabled}
			/>
			{errorMsg && <p className="form-input-hint">{errorMsg}</p>}
		</div>
	);
}
