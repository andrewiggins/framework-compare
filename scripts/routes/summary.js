const { writeFile } = require("fs").promises;
const { h } = require("preact");
const { outputPath } = require("../util");

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["SummaryPage"]} SummaryPage
 * @param {import('../data').FrameworkData} frameworkData
 */
async function buildSummaryView(renderPage, SummaryPage, frameworkData) {
	const url = "index.html";
	const page = h(SummaryPage, { frameworkData });
	const summaryHtml = renderPage(page, {
		title: "Summary - Framework Compare",
		url
	});
	await writeFile(outputPath("index.html"), summaryHtml, "utf8");
}

module.exports = {
	buildSummaryView
};
