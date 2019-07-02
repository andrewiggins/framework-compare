import { h } from "preact";

/**
 * @param {{ data: import('../data').FrameworkData; }} props
 */
export const Nav = props => (
	<div class="nav">
		<div class="section">
			<div class="section-header c-hand">
				{/* <i class="icon icon-arrow-right mr-1"></i> */}
				About
			</div>
			<div class="section-body">
				<ul class="menu menu-nav">
					<li class="menu-item">
						{/* TODO: Generate this URL path */}
						<a href="">Summary</a>
					</li>
				</ul>
			</div>
		</div>
		{props.data.map(framework => (
			<details class="section accordion">
				{/* TODO: Add active accordion logic */}
				<summary class="section-header accordion-header c-hand">
					<i class="icon icon-arrow-right mr-1" />
					{framework.name}
				</summary>
				<div class="section-body accordion-body">
					<ul class="menu menu-nav">
						{framework.apps.map(app => (
							<li class="menu-item">
								{/* TODO: Add active link logic */}
								<a href={app.htmlUrl}>{app.name}</a>
							</li>
						))}
					</ul>
				</div>
			</details>
		))}
	</div>
);
