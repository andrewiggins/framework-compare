interface JSXAttributes {
	children: HTMLElement[];
}

type HTMLElementsMap = {
	[K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] & JSXAttributes;
};

declare namespace JSX {
	interface Element extends HTMLElement {}
	interface ElementChildrenAttribute {
		children: Array<HTMLElement | string>;
	}
	interface IntrinsicElements extends HTMLElementsMap {}
}
