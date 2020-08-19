import { writeFile } from "fs/promises";
import { relative } from "path";
import { h } from "preact";
import { p, toUrl } from "../util.js";

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["IntroPage"]} IntroPage
 */
export async function buildIntroPage(renderPage, IntroPage) {
	const file = p("index.html");
	const page = h(IntroPage, {});
	const introHtml = renderPage(page, {
		title: "Introduction",
		url: toUrl(relative(p(), file))
	});
	await writeFile(file, introHtml, "utf8");
}
