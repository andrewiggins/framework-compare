import { h, Fragment } from "preact";
import cc from "classcat";
import prettyBytes from "pretty-bytes";

const getSrcId = (app, srcFile) => `${app}-${srcFile}`;

/**
 * @param {{ app: import('../data').AppData; appSrc: string }} props
 */
export const AppPage = ({ app, appSrc }) => {
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
								<a href={"#" + getSrcId(app.name, srcFile)}>{srcFile}</a>
							</li>
						))}
					</ul>
				</div>
				<div class="panel-body">
					{sourceFiles.map(srcFile => (
						<div class="tab-body" id={getSrcId(app.name, srcFile)}>
							<pre class="line-numbers">
								<code class={`language-${srcFile.split(".").pop()}`}>
									{app.sources[srcFile].trim()}
								</code>
							</pre>
						</div>
					))}
				</div>
			</div>
			<script src={appSrc} type="text/javascript" />
		</Fragment>
	);
};
