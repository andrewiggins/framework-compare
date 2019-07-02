import { h } from "preact";

/**
 * @param {{ title: string; children?: any }} props
 */
export const PageHeader = ({ title, children }) => (
	<div class="page-header">
		<h1 class="page-title">{title}</h1>
		{children && <div class="metadata">{children}</div>}
	</div>
);
