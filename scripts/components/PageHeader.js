import { h } from "preact";

/**
 * @param {{ title: string; children?: any }} props
 */
export const PageHeader = ({ title, children }) => (
	<div class="page-header">
		<a class="off-canvas-toggle btn btn-primary btn-action" href="#sidebar" aria-label="Show navigation menu">
			<i class="icon icon-menu" />
		</a>
		<h1 class="page-title">{title}</h1>
		{children && <div class="metadata">{children}</div>}
	</div>
);
