import { h, Fragment } from "preact";
import { PageHeader } from "./PageHeader";
import { appSorter } from "./util";

/**
 * @param {{ frameworkData: import('../data').FrameworkData }} props
 */
export function SummaryPage(props) {
	const { frameworkData } = props;

	/** @type {Record<string, Record<string, import('../data').AppData>>} */
	let apps = {};
	let frameworks = [];
	let headers = [];

	for (let framework of frameworkData) {
		frameworks.push(framework.name);
		headers.push(framework.name);

		for (let app of framework.apps) {
			if (!(app.name in apps)) {
				apps[app.name] = {};
			}

			apps[app.name][framework.name] = app;
		}
	}

	/** @type {Array<Array<string | number>>} */
	const data = [];
	for (let appName of Object.keys(apps).sort(appSorter)) {
		/** @type {Array<string | number>} */
		const row = [appName];
		for (let framework of frameworks) {
			const appData = apps[appName][framework];
			if (appData) {
				row.push("" + appData.gzipSize + " B");
			}
			else {
				row.push("—");
			}
		}

		data.push(row);
	}

	return (
		<Fragment>
			<PageHeader title="Summary" />
			<table class="table table-striped table-hover">
				<thead>
					<tr>
						<th>App GUI</th>
						{headers.map(header => (
							<th>{header}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map(row => (
						<tr>
							{row.map(cell => (
								<td>{cell}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</Fragment>
	);
}
