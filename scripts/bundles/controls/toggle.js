import { getCookie, setCookie } from "../utils/cookie";

const getToggleCookieName = id => `toggle-default-${id}`;

export function setupToggle() {
	/** @type {HTMLElement[]} */
	const toggleParents = Array.from(document.querySelectorAll("[data-toggle]"));
	for (const toggleParent of toggleParents) {
		const parentId = toggleParent.id;
		const [id1, id2] = toggleParent
			.getAttribute("data-toggle")
			.replace(/\s+/g, " ")
			.split(" ");

		/** @type {HTMLInputElement} */
		const input = toggleParent.querySelector("input[type=checkbox]");

		const container1 = document.getElementById(id1);
		const container2 = document.getElementById(id2);

		const defaultShown = getCookie(getToggleCookieName(parentId));
		if (defaultShown == id2) {
			container1.style.display = "none";
			container2.style.display = "block";
			input.checked = true;
		} else {
			container1.style.display = "block";
			container2.style.display = "none";
			input.checked = false;
		}

		input.addEventListener("change", e => {
			if (container1.style.display == "none") {
				container1.style.display = "block";
				container2.style.display = "none";
				setCookie(getToggleCookieName(parentId), id1);
			} else {
				container1.style.display = "none";
				container2.style.display = "block";
				setCookie(getToggleCookieName(parentId), id2);
			}
		});
	}
}
