import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { createMockFetch, createMockFetchConfig } from "./controls/mockFetch";
import { installFetchDebugger } from "./controls/mockFetchDebugger";

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
fetchDebugger.show = true;
fetchDebugger.dialog = true;
document.body.appendChild(fetchDebugger);
