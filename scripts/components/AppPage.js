import { h, Fragment } from "preact";
import cc from "classcat";
import prettyBytes from "pretty-bytes";

const NEW_LINE_EXP = /\n(?!$)/g;

/** @type {(app: import('../data').AppData, srcFile: string) => string} */
const getSrcId = (app, srcFile) =>
	`${app.framework}/${app.name.replace(/ /g, "-")}/${srcFile}`;

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
 * @param {{ app: import('../data').AppData; }} props
 */
export const AppPage = ({ app }) => {
	const sourceFiles = Object.keys(app.sources);
	return (
		<Fragment>
			<div class="panel">
				<div class="panel-header">
					<h2 class="panel-title h4">Result</h2>
				</div>
				<div class="panel-body">
					<div id="app" />
				</div>
				<div class="panel-footer"></div>
			</div>
			<div class="panel">
				<div class="panel-header">
					<h2 class="panel-title h4">Source</h2>
					<div>Bundle sizes:</div>
					<div>{prettyBytes(app.gzipSize)} Gzip</div>
					<div>{prettyBytes(app.brotliSize)} Brotli</div>
				</div>
				<div class="panel-nav">
					<ul class="tab tab-block">
						{sourceFiles.map((srcFile, i) => (
							<li class={cc({ "tab-item": true, active: i == 0 })}>
								<a href={"#" + getSrcId(app, srcFile)}>{srcFile}</a>
							</li>
						))}
					</ul>
				</div>
				<div class="panel-body">
					{sourceFiles.map(srcFile => {
						let { contents, htmlContents, lang } = app.sources[srcFile];

						return (
							<div class="tab-body" id={getSrcId(app, srcFile)}>
								<pre class={`line-numbers language-${lang}`}>
									<code
										class={`language-${lang}`}
										dangerouslySetInnerHTML={{ __html: htmlContents }}
									></code>
									<LineNumbers contents={contents} />
								</pre>
							</div>
						);
					})}
				</div>
			</div>
		</Fragment>
	);
};
