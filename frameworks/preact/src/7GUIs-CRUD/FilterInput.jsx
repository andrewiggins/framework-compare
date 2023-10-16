/**
 * @param {{ value: string; onInput: preact.JSX.GenericEventHandler<HTMLInputElement>; }} props
 */
export function FilterInput({ value, onInput }) {
	return (
		<div class="form-group">
			<label class="form-label">Filter prefix: </label>
			<input type="text" class="form-input" value={value} onInput={onInput} />
		</div>
	);
}
