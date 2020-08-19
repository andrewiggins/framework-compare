import { publish } from "gh-pages";
import { p } from "./util.js";

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
