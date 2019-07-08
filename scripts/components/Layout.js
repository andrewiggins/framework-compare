import { h } from "preact";
import { Nav } from "./Nav";
import { relativeUrl } from "./util";

/**
 * @typedef Props
 * @property {string} title
 * @property {string} siteCss
 * @property {string} url
 * @property {import('../data').FrameworkData} data
 * @property {any} children
 * @param {Props} props
 */
export const Layout = props => (
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta http-equiv="X-UA-Compatible" content="ie=edge" />
			<title>{props.title || "Framework Compare"}</title>
			<link rel="stylesheet" href={relativeUrl(props.url, "dist/spectre.min.css")} />
			<link rel="stylesheet" href={relativeUrl(props.url, "dist/spectre-exp.min.css")} />
			<link rel="stylesheet" href={relativeUrl(props.url, "dist/spectre-icons.min.css")} />
			<link rel="stylesheet" href={relativeUrl(props.url, "dist/site.css")} />
		</head>
		<body>
			<div class="off-canvas off-canvas-sidebar-show">
				<div class="navbar">
					<a
						class="off-canvas-toggle btn btn-primary btn-action"
						href="#sidebar"
					>
						<i class="icon icon-menu" />
					</a>
				</div>

				<div id="sidebar" class="sidebar off-canvas-sidebar">
					<div class="brand">Framework Compare</div>
					<Nav url={props.url} data={props.data} />
				</div>

				<a class="off-canvas-overlay" href="#close" />

				<div class="off-canvas-content">{props.children}</div>
			</div>
		</body>
	</html>
);
