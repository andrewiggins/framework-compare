import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { createMockFetch, createMockFetchConfig } from "./controls/mockFetch";

window.mockFetchConfig = createMockFetchConfig();
window.mockFetchConfig.log = (...msgs) => console.log(...msgs);

window.mockFetch = createMockFetch(window.mockFetchConfig);

installPolyfill();
setupTabs();
setupToggle();
setupOffCanvas();
