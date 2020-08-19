import { h, Fragment } from "preact";
import cc from "classcat";
import prettyBytes from "pretty-bytes";
import { relativeUrl } from "./util.js";
import { SettingsCog } from "./SettingsCog.js";

const NEW_LINE_EXP = /\n(?!$)/g;

/** @type {(app: import('../data').AppData, srcFile: string) => string} */
const getSrcId = (app, srcFile) =>
	`${app.frameworkId}/${app.appId.replace(/ /g, "-")}/src/${srcFile}`;

/** @type {(app: import('../data').AppData, srcFile: string) => string} */
const getBundleId = (app, bundleFile) =>
	`${app.frameworkId}/${app.appId.replace(/ /g, "-")}/bundle/${bundleFile}`;

function LineNumbers({ contents }) {
	const lines = contents.split(NEW_LINE_EXP);
	return (
		<span class="line-numbers-rows" aria-hidden="true">
			{lines.map(() => (
				<span />
			))}
		</span>
	);
}

/**
 * @param {{ app: import('../data').AppData; hidden?: boolean; }} props
 */
function SourcesPanel({ app, hidden }) {
	const sourceFiles = Object.keys(app.sources);
	return (
		<div
			id="sources"
			class="sources code panel"
			style={{ display: hidden ? "none" : "block" }}
		>
			<div class="panel-header">
				<h2 class="panel-title h4">Source</h2>
			</div>
			<div class="panel-nav">
				<ul class="tab tab-block">
					{sourceFiles.map((srcFile, i) => (
						<li class="tab-item">
							<a
								class={cc({ active: i == 0 })}
								href={"#" + getSrcId(app, srcFile)}
							>
								{srcFile}
							</a>
						</li>
					))}
				</ul>
			</div>
			<div class="panel-body">
				{sourceFiles.map((srcFile, i) => {
					let { contents, htmlContents, lang } = app.sources[srcFile];

					return (
						<div
							class={cc({ "tab-body": true, active: i == 0 })}
							id={getSrcId(app, srcFile)}
						>
							<pre class={`line-numbers language-${lang}`}>
								<code
									class={`language-${lang}`}
									dangerouslySetInnerHTML={{ __html: htmlContents }}
								/>
								<LineNumbers contents={contents} />
							</pre>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/**
 * @param {{ app: import('../data').AppData; currentUrl: string; }} props
 */
function BundlesPanel({ app, currentUrl }) {
	return (
		<div id="bundles" class="bundles panel">
			<div class="panel-header">
				<h2 class="panel-title h4">Bundles</h2>
			</div>
			<div class="panel-body">
				<SizeTable app={app} currentUrl={currentUrl} />
			</div>
		</div>
	);
}

/**
 * @param {{ app: import('../data').AppData; currentUrl: string; }} props
 */
function SizeTable({ app, currentUrl }) {
	const bundleFiles = Object.keys(app.bundles);
	let tableClass = "table table-striped table-scroll";
	if (bundleFiles.length > 1) {
		tableClass += " table-hover";
	}

	return (
		<table class={tableClass}>
			<thead>
				<tr>
					<th>Bundle</th>
					<th>Minified</th>
					<th>Gzip</th>
					<th>Brotli</th>
				</tr>
			</thead>
			<tbody>
				{bundleFiles.map(bundleName => {
					const bundle = app.bundles[bundleName];
					const url = relativeUrl(currentUrl, bundle.url);
					return (
						<tr>
							<td>
								<a href={url} target="_blank">
									{bundleName}
								</a>
							</td>
							<td>{prettyBytes(bundle.sizes.minified)}</td>
							<td>{prettyBytes(bundle.sizes.gzip)}</td>
							<td>{prettyBytes(bundle.sizes.brotli)}</td>
						</tr>
					);
				})}
			</tbody>
			{bundleFiles.length > 1 && (
				<tfoot>
					<tr>
						<td>Totals</td>
						<td>{prettyBytes(app.totalSizes.minified)}</td>
						<td>{prettyBytes(app.totalSizes.gzip)}</td>
						<td>{prettyBytes(app.totalSizes.brotli)}</td>
					</tr>
				</tfoot>
			)}
		</table>
	);
}

function AppPanel() {
	return (
		<div class="panel result">
			<div class="panel-header">
				<h2 class="panel-title h4">App</h2>
			</div>
			<div class="panel-body">
				<div id="app" />
			</div>
			<div class="panel-footer" />
		</div>
	);
}

/**
 * @param {{ app: import('../data').AppData; currentUrl: string; }} props
 */
export function AppPage({ app, currentUrl }) {
	return (
		<div class="app-page-container">
			<AppPanel />
			<BundlesPanel app={app} currentUrl={currentUrl} />
			<SourcesPanel app={app} />
		</div>
	);
}
