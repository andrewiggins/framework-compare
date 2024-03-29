import { h } from "preact";
import { appSorter, getDisplayName, groupByApp, relativeUrl } from "./util.js";

const active = "active";

const aboutSection = {
	name: "About",
	pages: [
		{ name: "Introduction", url: "index.html" },
		{ name: "Summary", url: "summary.html" }
	]
};

const urlRegex =
	/(?:^|\/?)frameworks\/([A-Za-z0-9_\-]+)\/([A-Za-z0-9_\-]+)\/?/i;

/**
 * @param {string} url
 */
function getFrameworkFromUrl(url) {
	const match = url.match(urlRegex);
	return match && match[1];
}

function getAppFromUrl(url) {
	const match = url.match(urlRegex);
	return match && match[2];
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
						open={getFrameworkFromUrl(currentUrl) === framework.id}
					>
						<summary class="section-header accordion-header c-hand">
							<i class="icon icon-arrow-right mr-1" />
							{getDisplayName(framework.id)}
						</summary>
						<div class="section-body accordion-body">
							<ul class="menu menu-nav">
								{framework.apps.sort(appSorter).map(app => (
									<li class="menu-item">
										<a
											href={u(app.htmlUrl)}
											class={currentUrl == app.htmlUrl ? active : null}
										>
											{getDisplayName(app.appId)}
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
						open={getAppFromUrl(currentUrl) === app.id}
					>
						<summary class="section-header accordion-header c-hand">
							<i class="icon icon-arrow-right mr-1" />
							{getDisplayName(app.id)}
						</summary>
						<div class="section-body accordion-body">
							<ul class="menu menu-nav">
								{app.frameworks.sort(appSorter).map(app => (
									<li class="menu-item">
										<a
											href={u(app.htmlUrl)}
											class={currentUrl == app.htmlUrl ? active : null}
										>
											{getDisplayName(app.frameworkId)}
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
