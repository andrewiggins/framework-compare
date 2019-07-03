import { h } from "preact";

const active = "active";

/**
 * @param {{ url: string; data: import('../data').FrameworkData; }} props
 */
export const Nav = ({ data, url }) => (
	<div class="nav">
		<details class="section accordion" open={!url.includes("/")}>
			<summary class="section-header accordion-header c-hand">
				<i class="icon icon-arrow-right mr-1" />
				About
			</summary>
			<div class="section-body accordion-body">
				<ul class="menu menu-nav">
					<li class="menu-item">
						<a href="/" class={url === "index.html" ? active : null}>
							Summary
						</a>
					</li>
				</ul>
			</div>
		</details>
		<hr />
		{data.map(framework => (
			<details
				class="section accordion"
				open={url.toLowerCase().includes(framework.name.toLowerCase())}
			>
				<summary class="section-header accordion-header c-hand">
					<i class="icon icon-arrow-right mr-1" />
					{framework.name}
				</summary>
				<div class="section-body accordion-body">
					<ul class="menu menu-nav">
						{framework.apps.map(app => (
							<li class="menu-item">
								<a
									href={"/" + app.htmlUrl}
									class={app.htmlUrl == url ? active : null}
								>
									{app.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			</details>
		))}
	</div>
);
