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
