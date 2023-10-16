import { createTransformer } from "babel-jest";

// By default, babel-jest looks for a babel.config.js to determine the configuration
// to use to run tests. We don't want to add a babel.config.js at the root of this project
// because not all subpackages (e.g. Svelte, Vue) use Babel and we wouldn't want the presence
// of this global babel config to mess with the building of these packages. However, we do
// want all of our test files to be run through Babel so instead of messing around with config
// files which didn't intuitively work (specifically the date.test.js file cuz it imports a file
// outside of the "tests" directory where we could put a babel config), we are manually specifying
// a Babel config here
export default createTransformer({
	presets: [
		[
			"@babel/preset-react",
			{
				pragma: "toHtmlString",
				pragmaFrag: "toHtmlString.Fragment"
			}
		]
	]
});
