import { h } from "preact";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { PageHeader } from "./PageHeader";
import { relativeUrl } from "./util";

/**
 * @typedef Props
 * @property {string} title
 * @property {string} siteCss
 * @property {string} url
 * @property {import('../data').FrameworkData} data
 * @property {string} bodyClass
 * @property {string[]} [scripts]
 * @property {any} children
 * @param {Props} props
 */
export const Layout = props => {
	const u = url => relativeUrl(props.url, url);
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta http-equiv="X-UA-Compatible" content="ie=edge" />
				<title>
					{(props.title ? props.title + " - " : "") + "Framework Compare"}
				</title>
				<link rel="stylesheet" href={u("dist/spectre.css-bundle.min.css")} />
				<link rel="stylesheet" href={u("dist/prismjs-bundle.min.css")} />
				<link rel="stylesheet" href={u("dist/site.min.css")} />
			</head>
			<body class={props.bodyClass}>
				<div class="off-canvas off-canvas-sidebar-show">
					<div id="sidebar" class="sidebar off-canvas-sidebar">
						<div class="brand">Framework Compare</div>
						<Nav url={props.url} data={props.data} />
					</div>

					<a class="off-canvas-overlay" href="#close" />

					<div class="page-wrapper off-canvas-content">
						<PageHeader title={props.title} />
						<div class="page-contents">{props.children}</div>
						<Footer />
					</div>
				</div>
				<script src={u("dist/site.js")} />
				{props.scripts &&
					props.scripts.map(script => <script src={u(script)} />)}
			</body>
		</html>
	);
};
