export function getCookie(name) {
	const values = document.cookie.match(
		"(^|[^;]+)\\s*" + encodeURIComponent(name) + "\\s*=\\s*([^;]+)"
	);
	return values ? values.pop() : "";
}

export function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
