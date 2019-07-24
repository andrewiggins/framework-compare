import { h } from "preact";
import { appSorter, relativeUrl, getFramework } from "./util";

const active = "active";

const aboutSection = {
	name: "About",
	pages: [
		{ name: "Introduction", url: "index.html" },
		{ name: "Summary", url: "dist/summary.html" }
	]
};

/**
 * @param {{ url: string; data: import('../data').FrameworkData; }} props
 */
export const Nav = ({ data, url }) => (
	<div class="nav">
		<details
			class="section accordion"
			open={aboutSection.pages.map(page => page.url).includes(url)}
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
								href={relativeUrl(url, page.url)}
								class={url === page.url ? active : null}
							>
								{page.name}
							</a>
						</li>
					))}
				</ul>
			</div>
		</details>
		<hr />
		{data.map(framework => (
			<details
				class="section accordion"
				open={getFramework(url) === framework.name}
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
									href={relativeUrl(url, app.htmlUrl)}
									class={app.htmlUrl == url ? active : null}
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
);
