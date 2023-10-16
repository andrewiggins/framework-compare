import { h } from "preact";
import { Nav } from "./Nav.js";
import { Footer } from "./Footer.js";
import { PageHeader } from "./PageHeader.js";
import { relativeUrl } from "./util.js";

/**
 * @typedef LayoutProps
 * @property {string} [title]
 * @property {string} url
 * @property {import('../data').FrameworkData} data
 * @property {string} [bodyClass]
 * @property {string[]} [scripts]
 * @property {any} children
 * @param {LayoutProps} props
 */
export const Layout = props => {
	const u = url => relativeUrl(props.url, url);
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta http-equiv="X-UA-Compatible" content="ie=edge" />
				<meta
					name="description"
					content="Compare how apps are built across multiple popular web frameworks"
				/>
				<title>
					{(props.title ? props.title + " - " : "") + "Framework Compare"}
				</title>
				<link rel="stylesheet" href={u("spectre-bundle.min.css")} />
				<link rel="stylesheet" href={u("prismjs-bundle.min.css")} />
				<link rel="stylesheet" href={u("site-bundle.min.css")} />
			</head>
			<body class={props.bodyClass}>
				<div class="off-canvas off-canvas-sidebar-show">
					<div id="sidebar" class="sidebar off-canvas-sidebar">
						<div class="brand">Framework Compare</div>
						<Nav url={props.url} data={props.data} />
					</div>

					<a
						class="off-canvas-overlay"
						href="#close"
						aria-label="Collapse navigation menu"
					/>

					<div class="page-wrapper off-canvas-content">
						<PageHeader title={props.title} />
						<div class="page-contents">{props.children}</div>
						<Footer />
					</div>
				</div>
				<script src={u("site.js")} />
				{props.scripts &&
					props.scripts.map(script => <script src={u(script)} />)}
			</body>
		</html>
	);
};
