import { html, render } from "lit";

const Counter = (count, increment) => html`
	<button
		class="btn badge"
		data-badge=${count}
		style="margin-top: 0.5rem;"
		@click=${increment}
	>
		count: ${count}
	</button>
`;

const container = document.getElementById("app");

function update(count) {
	const increment = () => update(count + 1);
	render(Counter(count, increment), container);
}

update(0);
