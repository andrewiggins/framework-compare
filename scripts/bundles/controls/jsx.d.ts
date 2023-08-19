type Children = undefined | string | JSX.Element | Array<Children>;

interface JSXAttributes {
	children?: Children;

	// Attributes that this JSX allows
	class?: string;
	for?: string;
	id?: string;
}

type JSXHTMLElement<T> = Partial<Omit<HTMLElementTagNameMap[T], "children">>;

type HTMLElementsMap = {
	[K in keyof HTMLElementTagNameMap]: JSXHTMLElement<K> & JSXAttributes;
};

declare namespace JSX {
	interface Element extends HTMLElement {}
	interface ElementChildrenAttribute {
		children?: Children;
	}
	interface IntrinsicElements extends HTMLElementsMap {
		// Custom elements
		"draggable-dialog": JSXAttributes;
	}
}
