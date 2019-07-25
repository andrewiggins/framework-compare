import { h, Fragment } from "preact";
import cc from "classcat";
import prettyBytes from "pretty-bytes";

const NEW_LINE_EXP = /\n(?!$)/g;

/** @type {(app: import('../data').AppData, srcFile: string) => string} */
const getSrcId = (app, srcFile) =>
	`${app.framework}/${app.appName.replace(/ /g, "-")}/${srcFile}`;

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
			<div class="panel result">
				<div class="panel-header">
					<h2 class="panel-title h4">Result</h2>
				</div>
				<div class="panel-body">
					<div id="app" />
				</div>
				<div class="panel-footer" />
			</div>
			<div class="panel source">
				<div class="panel-header">
					<h2 class="panel-title h4">Source</h2>
					<div>Bundle sizes:</div>
					<div>{prettyBytes(app.sizes.minified)} minified</div>
					<div>{prettyBytes(app.sizes.gzip)} Gzip</div>
					<div>{prettyBytes(app.sizes.brotli)} Brotli</div>
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
		</Fragment>
	);
};
