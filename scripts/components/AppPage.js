import { h, Fragment } from "preact";
import { PageHeader } from "./PageHeader";

/**
 * @param {{ app: import('../data').AppData; appSrc: string }} props
 */
export const AppPage = ({ app, appSrc }) => (
	<Fragment>
		<PageHeader title={`${app.framework} - ${app.name}`}>
			<div>Gzip: {app.gzipSize} B</div>
			<div>Brotli: {app.brotliSize} B</div>
		</PageHeader>
		<div id="app" />
		<script src={appSrc} type="text/javascript" />
	</Fragment>
);
