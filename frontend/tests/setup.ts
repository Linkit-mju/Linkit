import "@astryxdesign/core/astryx.css";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/theme-neutral/theme.css";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

function matchMedia(query: string): MediaQueryList {
  return {
    addEventListener: () => undefined,
    addListener: () => undefined,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: () => undefined,
    removeListener: () => undefined,
  };
}

Object.defineProperty(window, "matchMedia", {
  value: matchMedia,
  writable: true,
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});
