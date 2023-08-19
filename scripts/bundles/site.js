/// <reference path="global.d.ts" />

import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { createMockFetch, createMockFetchConfig } from "./controls/mockFetch";
import { installFetchDebugger } from "./controls/mockFetchDebugger";

window.createMockFetchConfig = createMockFetchConfig;
window.createMockFetch = createMockFetch;

window.mockFetchConfig = createMockFetchConfig();
window.mockFetchConfig.log = (...msgs) => console.log(...msgs);

window.mockFetch = createMockFetch(window.mockFetchConfig);

installFetchDebugger();
installPolyfill();
setupTabs();
setupToggle();
setupOffCanvas();

const fetchDebugger = document.createElement("mock-fetch-debugger");
fetchDebugger.config = window.mockFetchConfig;
window.fetchDebugger = fetchDebugger;

const draggableDialog = document.createElement("draggable-dialog");
draggableDialog.appendChild(fetchDebugger);
document.body.appendChild(draggableDialog);
