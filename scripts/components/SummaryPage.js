import { h } from "preact";

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

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
		headers.push(capitalize(framework.name));

		for (let app of framework.apps) {
			if (!(app.name in apps)) {
				apps[app.name] = {};
			}

			apps[app.name][framework.name] = app;
		}
	}

	/** @type {Array<Array<string | number>>} */
	const data = [];
	for (let appName of Object.keys(apps)) {
		/** @type {Array<string | number>} */
		const row = [appName];
		for (let framework of frameworks) {
			row.push(apps[appName][framework].gzipSize);
		}

		data.push(row);
	}

	return (
		<table>
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
	);
}
