// Use babel.config.js to override local .babelrc in Svelte
export default function (api) {
	api.cache(true);

	return {
		presets: [
			[
				"@babel/preset-env",
				{
					loose: true,
					modules: false
				}
			]
		]
	};
}
