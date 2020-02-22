import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { installMockFetch } from "./controls/mockFetch";

installMockFetch();
installPolyfill();
setupTabs();
setupToggle();
setupOffCanvas();
