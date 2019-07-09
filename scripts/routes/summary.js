const { writeFile } = require("fs").promises;
const path = require("path");
const { h } = require("preact");
const { p, outputPath, toUrl } = require("../util");

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["SummaryPage"]} SummaryPage
 * @param {import('../data').FrameworkData} frameworkData
 */
async function buildSummaryView(renderPage, SummaryPage, frameworkData) {
	const file = outputPath("summary.html");
	const page = h(SummaryPage, { frameworkData });
	const summaryHtml = renderPage(page, {
		title: "Summary",
		url: toUrl(path.relative(p(), file))
	});
	await writeFile(file, summaryHtml, "utf8");
}

module.exports = {
	buildSummaryView
};
