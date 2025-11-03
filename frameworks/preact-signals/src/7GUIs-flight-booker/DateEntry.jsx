/** @import { Signal } from "@preact/signals" */

/**
 * @param {{ label: string; date: Signal<string>; setDate(date: string): void; errorMsg: Signal<string>; disabled?: Signal<boolean>; }} props
 * @returns {preact.JSX.Element}
 */
export function DateEntry({ label, date, setDate, errorMsg, disabled }) {
	const inputId = `${label}-date`;
	return (
		<div class={"form-group" + (errorMsg.value ? " has-error" : "")}>
			<label class="form-label" for={inputId}>
				{label}
			</label>
			<input
				id={inputId}
				class="form-input"
				type="text"
				value={date}
				onInput={e => setDate(e.currentTarget.value)}
				disabled={disabled ?? false}
			/>
			{errorMsg.value && <p class="form-input-hint">{errorMsg}</p>}
		</div>
	);
}
