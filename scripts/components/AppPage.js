import { h, Fragment } from "preact";
import { PageHeader } from "./PageHeader";

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
				<div>Gzip: {app.gzipSize} B</div>
				<div>Brotli: {app.brotliSize} B</div>
			</div>
		</div>
		<script src={appSrc} type="text/javascript" />
	</Fragment>
);
