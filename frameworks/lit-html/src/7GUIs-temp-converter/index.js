import { html, render } from "lit-html";

const TempConverter = (c, f, setBothFromC, setBothFromF) => html`
	<input .value=${c} @input=${setBothFromC} type="number" />
	°c =
	<input .value=${f} @input=${setBothFromF} type="number" />
	°f
`;

const container = document.getElementById("app");

function update(c, f) {
	/** @param {Event} e */
	function setBothFromC(e) {
		c = e.target.value;
		f = +(32 + (9 / 5) * c).toFixed(1);
		update(c, f);
	}

	/** @param {Event} e */
	function setBothFromF(e) {
		f = e.target.value;
		c = +((5 / 9) * (f - 32)).toFixed(1);
		update(c, f);
	}

	render(TempConverter(c, f, setBothFromC, setBothFromF), container);
}

update("", "");
