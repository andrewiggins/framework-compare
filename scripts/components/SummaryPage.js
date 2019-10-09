import { h, Fragment } from "preact";
import { appSorter, getDisplayName } from "./util";
import prettyBytes from "pretty-bytes";

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
		const frameworkName = getDisplayName(framework.id);
		frameworks.push(frameworkName);
		headers.push(frameworkName);

		for (let app of framework.apps) {
			const appName = getDisplayName(app.appId);
			if (!(appName in apps)) {
				apps[appName] = {};
			}

			apps[appName][frameworkName] = app;
		}
	}

	/** @type {Array<Array<string | number>>} */
	const gzipData = [];
	const brotliData = [];
	const minifiedData = [];
	for (let appName of Object.keys(apps).sort(appSorter)) {
		/** @type {Array<string | number>} */
		const gzipRow = [appName];
		/** @type {Array<string | number>} */
		const brotliRow = [appName];
		/** @type {Array<string | number>} */
		const minifiedRow = [appName];
		for (let frameworkName of frameworks) {
			const appData = apps[appName][frameworkName];
			if (appData) {
				gzipRow.push(prettyBytes(appData.totalSizes.gzip));
				brotliRow.push(prettyBytes(appData.totalSizes.brotli));
				minifiedRow.push(prettyBytes(appData.totalSizes.minified));
			} else {
				brotliRow.push("—");
				gzipRow.push("—");
				minifiedRow.push("—");
			}
		}

		gzipData.push(gzipRow);
		brotliData.push(brotliRow);
		minifiedData.push(minifiedRow);
	}

	const allData = [
		{ name: "Brotli-data", data: brotliData },
		{ name: "Gzip-data", data: gzipData },
		{ name: "Minified-data", data: minifiedData }
	];

	return (
		<Fragment>
			{allData.map(({ name, data }) => (
				<Fragment>
					<h2>{name.split("-")[0]}</h2>
					<table
						key={name}
						id={name}
						class="table table-striped table-hover table-scroll"
						style="margin: 1rem 0"
					>
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
