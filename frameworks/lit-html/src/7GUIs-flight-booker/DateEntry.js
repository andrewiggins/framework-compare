import { html } from "lit-html";

export function DateEntry(label, date, errorMsg, setDate, disabled = false) {
	const inputId = label + "-date";

	let errorMarkup;
	if (errorMsg) {
		errorMarkup = html`
			<p class="form-input-hint">${errorMsg}</p>
		`;
	}

	return html`
		<div class=${"form-group" + (errorMsg ? " has-error" : "")}>
			<label class="form-label" for=${inputId}>${label}</label
			><input
				id=${inputId}
				class="form-input"
				type="text"
				value=${date}
				@input=${e => setDate(e.target.value)}
				?disabled=${disabled}
			/>
			${errorMarkup}
		</div>
	`;
}
