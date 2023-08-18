import { writeFile } from "fs/promises";
import { relative } from "path";
import { h } from "preact";
import { p, outputPath, toUrl } from "../util.js";

/**
 * @param {import('../build').Renderer} renderPage
 * @param {import('../build').Components["SummaryPage"]} SummaryPage
 * @param {import('../data').FrameworkData} frameworkData
 */
export async function buildSummaryView(renderPage, SummaryPage, frameworkData) {
	const file = outputPath("summary.html");
	const page = h(SummaryPage, { frameworkData });
	const summaryHtml = renderPage(page, {
		title: "Summary",
		url: toUrl(file)
	});
	await writeFile(file, summaryHtml, "utf8");
}
