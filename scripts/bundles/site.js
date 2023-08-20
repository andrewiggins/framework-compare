/// <reference path="global.d.ts" />

import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { createMockFetch, createMockFetchConfig } from "./controls/mockFetch";
import { installFetchDebugger } from "./controls/mockFetchDebugger";

function setupFetchDebugger() {
	installFetchDebugger();

	window.createMockFetchConfig = createMockFetchConfig;
	window.createMockFetch = createMockFetch;

	window.mockFetchConfig = createMockFetchConfig();
	window.mockFetchConfig.log = (...msgs) => console.log(...msgs);

	window.mockFetch = createMockFetch(window.mockFetchConfig);

	const fetchDebugger = document.createElement("mock-fetch-debugger");
	fetchDebugger.config = window.mockFetchConfig;
	window.fetchDebugger = fetchDebugger;

	const draggableDialog = document.createElement("draggable-dialog");
	draggableDialog.appendChild(fetchDebugger);
	if (!location.href.toLowerCase().includes("7guis-crud")) {
		draggableDialog.setAttribute("hidden", "");
	}
	document.body.appendChild(draggableDialog);

	window.addEventListener("keypress", e => {
		if (e.key === "d") {
			draggableDialog.toggleAttribute("hidden");
		}
	});
}

installPolyfill();
setupTabs();
setupToggle();
setupOffCanvas();
setupFetchDebugger();
