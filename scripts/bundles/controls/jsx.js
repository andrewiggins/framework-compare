const hasOwn = Object.prototype.hasOwnProperty;

/** @type {import('./jsx').h} */
function h(tag, attributes, ...children) {
	const element = document.createElement(tag);

	for (let attr in attributes) {
		if (hasOwn.call(attributes, attr)) {
			if (attr in element) {
				element[attr] = attributes[attr];
			} else {
				element.setAttribute(attr, attributes[attr]);
			}
		}
	}

	for (let child of children) {
		if (typeof child == "string") {
			element.appendChild(document.createTextNode(child));
		} else {
			element.appendChild(child);
		}
	}

	return element;
}
