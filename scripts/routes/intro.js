const { writeFile } = require("fs").promises;
const path = require("path");
const { h } = require("preact");
const { p, toUrl } = require("../util");

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["IntroPage"]} IntroPage
 */
async function buildIntroPage(renderPage, IntroPage) {
	const file = p("index.html");
	const page = h(IntroPage, {});
	const introHtml = renderPage(page, {
		title: "Introduction",
		url: toUrl(path.relative(p(), file))
	});
	await writeFile(file, introHtml, "utf8");
}

module.exports = {
	buildIntroPage
};
