import { h, Fragment } from "preact";
import cc from "classcat";
import prettyBytes from "pretty-bytes";
import { SettingsCog } from "./SettingsCog";

const NEW_LINE_EXP = /\n(?!$)/g;

/** @type {(app: import('../data').AppData, srcFile: string) => string} */
const getSrcId = (app, srcFile) =>
	`${app.framework}/${app.appName.replace(/ /g, "-")}/src/${srcFile}`;

/** @type {(app: import('../data').AppData, srcFile: string) => string} */
const getBundleId = (app, bundleFile) =>
	`${app.framework}/${app.appName.replace(/ /g, "-")}/bundle/${bundleFile}`;

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
			class="panel code"
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
 * @param {{ app: import('../data').AppData; hidden?: boolean; }} props
 */
function BundlesPanel({ app, hidden }) {
	const bundleFiles = Object.keys(app.bundles);
	return (
		<div
			id="bundles"
			class="panel code"
			style={{ display: hidden ? "none" : "block" }}
		>
			<div class="panel-header">
				<h2 class="panel-title h4">Bundles</h2>
			</div>
			<div class="panel-nav">
				<ul class="tab tab-block">
					{bundleFiles.map((bundleFile, i) => (
						<li class="tab-item">
							<a
								class={cc({ active: i == 0 })}
								href={"#" + getBundleId(app, bundleFile)}
							>
								{bundleFile}
							</a>
						</li>
					))}
				</ul>
			</div>
			<div class="panel-body">
				{bundleFiles.map((bundleFile, i) => {
					let { contentLength, url, lang } = app.bundles[bundleFile];

					return (
						<div
							class={cc({ "tab-body": true, active: i == 0 })}
							id={getBundleId(app, bundleFile)}
						>
							{contentLength < 50e3 ? (
								<pre data-src={url} class={`language-${lang}`}>
									<code class={`lang-${lang}`}>Loading...</code>
								</pre>
							) : (
								<div>
									File is too big display.{" "}
									<a href={url} target="_blank">
										Download it instead.
									</a>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ResultsPanel() {
	return (
		<div class="panel result">
			<div class="panel-header">
				<h2 class="panel-title h4">Result</h2>
			</div>
			<div class="panel-body">
				<div id="app" />
			</div>
			<div class="panel-footer" />
		</div>
	);
}

/**
 * @param {{ app: import('../data').AppData }} props
 */
function MetadataPanel({ app }) {
	const bundleFiles = Object.keys(app.bundles);
	return (
		<div class="panel metadata">
			<div class="panel-header">
				<h2 class="panel-title h4">Metadata</h2>
			</div>
			<div class="panel-body">
				<table class="table table-striped table-hover table-scroll">
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
							return (
								<tr>
									<td>{bundleName}</td>
									<td>{prettyBytes(bundle.sizes.minified)}</td>
									<td>{prettyBytes(bundle.sizes.gzip)}</td>
									<td>{prettyBytes(bundle.sizes.brotli)}</td>
								</tr>
							);
						})}
					</tbody>
					{bundleFiles.length > 1 &&
						<tfoot>
							<tr>
								<td>Totals</td>
								<td>{prettyBytes(app.totalSizes.minified)}</td>
								<td>{prettyBytes(app.totalSizes.gzip)}</td>
								<td>{prettyBytes(app.totalSizes.brotli)}</td>
							</tr>
						</tfoot>
					}
				</table>
			</div>
			<div class="panel-footer" />
		</div>
	);
}

function CodeSettings() {
	return (
		<details class="code-settings dropdown dropdown-right">
			<summary class="c-hand" aria-label="Change sources view">
				<SettingsCog />
			</summary>
			<ul class="menu">
				<li clsas="menu-item">
					<label class="form-switch" data-toggle="sources bundles">
						<input type="checkbox" />
						<i class="form-icon" /> View bundled output
					</label>
				</li>
				<li clsas="menu-item">
					<label class="form-switch">
						<input type="checkbox" />
						<i class="form-icon" /> View ES6 module output
					</label>
				</li>
			</ul>
		</details>
	);
}

/**
 * @param {{ app: import('../data').AppData; }} props
 */
export function AppPage({ app }) {
	return (
		<div class="app-page-container">
			<ResultsPanel />
			<MetadataPanel app={app} />
			<div class="app-code-panels">
				<CodeSettings />
				<SourcesPanel app={app} />
				<BundlesPanel app={app} hidden />
			</div>
		</div>
	);
}
