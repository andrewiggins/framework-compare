const { publish } = require("gh-pages");
const { p } = require("./util");

publish(
	p(),
	{
		src: ["index.html", "dist/**/*"]
	},
	error => {
		if (error) {
			console.error(error);
			process.exit(1);
		}
	}
);
