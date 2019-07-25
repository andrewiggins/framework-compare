import { h, Fragment } from "preact";
import cc from "classcat";
import prettyBytes from "pretty-bytes";

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
 * @param {{ app: import('../data').AppData }} props
 */
function SourcePanelHeader({ app }) {
	return (
		<div class="panel-header">
			<h2 class="panel-title h4">Source</h2>
			<div>Bundle sizes:</div>
			<div>{prettyBytes(app.sizes.minified)} minified</div>
			<div>{prettyBytes(app.sizes.gzip)} Gzip</div>
			<div>{prettyBytes(app.sizes.brotli)} Brotli</div>
		</div>
	);
}

/**
 * @param {{ app: import('../data').AppData; id: string; hidden?: boolean; children: any }} props
 */
function SourcePanel({ app, id, hidden, children }) {
	return (
		<div
			id={id}
			class="panel source"
			style={{ display: hidden ? "none" : "block" }}
		>
			<SourcePanelHeader app={app} />
			{children}
		</div>
	);
}

/**
 * @param {{ app: import('../data').AppData }} props
 */
function SourceFilesPanelBody({ app }) {
	const sourceFiles = Object.keys(app.sources);
	return (
		<Fragment>
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
		</Fragment>
	);
}

/**
 * @param {{ app: import('../data').AppData }} props
 */
function BundleFilesPanelBody({ app }) {
	const bundleFiles = Object.keys(app.bundles);
	return (
		<Fragment>
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
		</Fragment>
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
 * @param {{ app: import('../data').AppData; }} props
 */
export function AppPage({ app }) {
	return (
		<Fragment>
			<ResultsPanel />
			<SourcePanel id="sources" app={app}>
				<SourceFilesPanelBody app={app} />
			</SourcePanel>
			{/* TODO: Consider showing bundle output... */}
			{/* <SourcePanel id="bundle" app={app} hidden>
				<BundleFilesPanelBody app={app} />
			</SourcePanel> */}
		</Fragment>
	);
}
