export function setupOffCanvas() {
	toggleKeyPressListener();
	window.addEventListener("hashchange", toggleKeyPressListener);
}

function toggleKeyPressListener() {
	if (location.hash === "#sidebar") {
		document.body.addEventListener("keydown", onKeyPress);
	} else if (location.hash === "#close") {
		document.body.removeEventListener("keydown", onKeyPress);
	}
}

/**
 * @param {KeyboardEvent} e
 */
function onKeyPress(e) {
	if (location.hash !== "#close" && e.key === "Escape") {
		location.hash = "#close";
	}
}
