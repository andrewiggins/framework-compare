type Children = undefined | string | JSXInternal.Element | Array<Children>;

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

declare namespace JSXInternal {
	interface Element extends HTMLElement {}
	interface ElementChildrenAttribute {
		children?: Children;
	}
	interface IntrinsicElements extends HTMLElementsMap {
		// Custom elements
		"draggable-dialog": JSXAttributes;
	}
}

export function h(
	tag: string,
	attributes: Record<string, string>,
	...children: Array<HTMLElement | string>
): HTMLElement;
namespace h {
	export import JSX = JSXInternal;
}
