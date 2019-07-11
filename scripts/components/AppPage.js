import { h, Fragment } from "preact";
import prettyBytes from "pretty-bytes";

/**
 * @param {{ app: import('../data').AppData; appSrc: string }} props
 */
export const AppPage = ({ app, appSrc }) => (
	<Fragment>
		<div class="panel">
			<div class="panel-header"></div>
			<div class="panel-body">
				<div id="app" />
			</div>
			<div class="panel-footer">
				<div>Gzip: {prettyBytes(app.gzipSize)}</div>
				<div>Brotli: {prettyBytes(app.brotliSize)}</div>
			</div>
		</div>
		<script src={appSrc} type="text/javascript" />
	</Fragment>
);
