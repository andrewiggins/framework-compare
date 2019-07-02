import { h, Fragment } from "preact";

export const AppPage = props => (
	<Fragment>
		<div id="app" />
		<script src={props.appSrc} type="text/javascript" />
	</Fragment>
);
