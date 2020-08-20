import ghPages from "gh-pages";
import { p } from "./util.js";

ghPages.publish(
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
