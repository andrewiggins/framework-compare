import { getCookie, setCookie } from "./utils/cookie";

const getToggleCookieName = id => `toggle-default-${id}`;

function setupToggle() {
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
		if (defaultShown)
		if (defaultShown == id2) {
			container1.style.display = "none";
			container2.style.display = "block";
			input.checked = true;
		} else {
			container1.style.display = "block";
			container2.style.display = "none";
		}

		input.addEventListener("input", e => {
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

function setupTabs() {
	const tabParents = Array.from(document.getElementsByClassName("tab"));
	for (const tabParent of tabParents) {
		var tabLinks = Array.from(tabParent.querySelectorAll(".tab-item a"));
		for (const tabLink of tabLinks) {
			tabLink.addEventListener("click", onTabLinkClick(tabLinks));
		}
	}
}

const onTabLinkClick = tabLinks => event => {
	event.preventDefault();

	clearTabs(tabLinks);
	const currentTab = /** @type {HTMLElement} */ (event.target);
	currentTab.classList.add("active");

	const tabBody = document.getElementById(
		currentTab.getAttribute("href").slice(1)
	);
	tabBody.classList.add("active");
};

/**
 * @param {Element[]} tabLinks
 */
function clearTabs(tabLinks) {
	for (let tabLink of tabLinks) {
		tabLink.classList.remove("active");

		const tabBody = document.getElementById(
			tabLink.getAttribute("href").slice(1)
		);
		tabBody.classList.remove("active");
	}
}

setupTabs();
setupToggle();
