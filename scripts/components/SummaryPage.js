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
	const gzipData = [];
	const brotliData = [];
	for (let appName of Object.keys(apps).sort(appSorter)) {
		/** @type {Array<string | number>} */
		const gzipRow = [appName];
		const brotliRow = [appName];
		for (let framework of frameworks) {
			const appData = apps[appName][framework];
			if (appData) {
				gzipRow.push("" + appData.gzipSize + " B");
				brotliRow.push("" + appData.brotliSize + " B");
			} else {
				brotliRow.push("—");
				gzipRow.push("—");
			}
		}

		gzipData.push(gzipRow);
		brotliData.push(brotliRow);
	}

	const allData = [
		{ name: "brotli-data", data: brotliData },
		{ name: "gzip-data", data: gzipData }
	];

	return (
		<Fragment>
			<PageHeader title="Summary" />
			{allData.map(({ name, data }) => (
				<Fragment>
					<h2>{name.split("-")[0]}</h2>
					<table key={name} id={name} class="table table-striped table-hover" style="margin: 1rem 0">
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
			))}
		</Fragment>
	);
}
