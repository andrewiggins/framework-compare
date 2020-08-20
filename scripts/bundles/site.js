import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { createMockFetch, createMockFetchConfig } from "./controls/mockFetch";

const isTest = location.search.includes("test=1");
const mockFetchConfig = createMockFetchConfig();
mockFetchConfig.areNewRequestsPaused = isTest;
mockFetchConfig.durationMs = isTest ? 0 : mockFetchConfig.durationMs;
mockFetchConfig.log = (...msgs) => console.log(...msgs);

window.mockFetchConfig = mockFetchConfig;
window.mockFetch = createMockFetch(mockFetchConfig);

installPolyfill();
setupTabs();
setupToggle();
setupOffCanvas();
