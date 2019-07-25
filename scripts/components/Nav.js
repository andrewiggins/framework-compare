import { h } from "preact";
import { appSorter, getDisplayName, groupByApp, relativeUrl } from "./util";

const active = "active";

const aboutSection = {
	name: "About",
	pages: [
		{ name: "Introduction", url: "index.html" },
		{ name: "Summary", url: "dist/summary.html" }
	]
};

const urlRegex = /\/frameworks\/([A-Za-z0-9_\-]+)\/([A-Za-z0-9_\-]+)\/?/i;

/**
 * @param {string} url
 */
function getFrameworkFromUrl(url) {
	const match = url.match(urlRegex);
	return match && getDisplayName(match[1]);
}

function getAppFromUrl(url) {
	const match = url.match(urlRegex);
	return match && getDisplayName(match[2]);
}

/**
 * @param {{ url: string; data: import('../data').FrameworkData; }} props
 */
export const Nav = ({ data: byFrameworkData, url: currentUrl }) => {
	const u = url => relativeUrl(currentUrl, url);
	const byAppData = groupByApp(byFrameworkData);
	return (
		<div class="nav">
			<details
				class="section accordion"
				open={aboutSection.pages.map(page => page.url).includes(currentUrl)}
			>
				<summary class="section-header accordion-header c-hand">
					<i class="icon icon-arrow-right mr-1" />
					{aboutSection.name}
				</summary>
				<div class="section-body accordion-body">
					<ul class="menu menu-nav">
						{aboutSection.pages.map(page => (
							<li class="menu-item">
								<a
									href={u(page.url)}
									class={currentUrl === page.url ? active : null}
								>
									{page.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</details>
			<hr />
			<div class="form-group">
				<label
					id="nav-sort"
					class="form-switch"
					data-toggle="by-framework-nav by-app-nav"
				>
					<input type="checkbox" />
					<i class="form-icon" /> Group by App
				</label>
			</div>
			<div id="by-framework-nav">
				{byFrameworkData.map(framework => (
					<details
						class="section accordion"
						open={getFrameworkFromUrl(currentUrl) === framework.name}
					>
						<summary class="section-header accordion-header c-hand">
							<i class="icon icon-arrow-right mr-1" />
							{framework.name}
						</summary>
						<div class="section-body accordion-body">
							<ul class="menu menu-nav">
								{framework.apps.sort(appSorter).map(app => (
									<li class="menu-item">
										<a
											href={u(app.htmlUrl)}
											class={currentUrl == app.htmlUrl ? active : null}
										>
											{app.appName}
										</a>
									</li>
								))}
							</ul>
						</div>
					</details>
				))}
			</div>
			<div id="by-app-nav" style="display: none">
				{byAppData.map(app => (
					<details
						class="section accordion"
						open={getAppFromUrl(currentUrl) === app.name}
					>
						<summary class="section-header accordion-header c-hand">
							<i class="icon icon-arrow-right mr-1" />
							{app.name}
						</summary>
						<div class="section-body accordion-body">
							<ul class="menu menu-nav">
								{app.frameworks.sort(appSorter).map(app => (
									<li class="menu-item">
										<a
											href={u(app.htmlUrl)}
											class={currentUrl == app.htmlUrl ? active : null}
										>
											{app.framework}
										</a>
									</li>
								))}
							</ul>
						</div>
					</details>
				))}
			</div>
		</div>
	);
};
