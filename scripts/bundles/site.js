import { setupTabs } from "./controls/tabs";
import { setupToggle } from "./controls/toggle";
import { setupOffCanvas } from "./controls/offcanvas";
import { installPolyfill } from "./controls/details-polyfill";
import { initBundleToggle } from "./controls/bundle-toggle";

installPolyfill();
setupTabs();
setupToggle();
setupOffCanvas();

initBundleToggle();
