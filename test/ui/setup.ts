import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Fail tests on React HTML nesting warnings (e.g. <div> inside <p>).
const originalError = console.error;
console.error = (...args: Parameters<typeof console.error>) => {
  if (typeof args[0] === "string" && /cannot be a descendant/.test(args[0])) {
    throw new Error(args[0]);
  }
  originalError(...args);
};

afterEach(() => {
  cleanup();
});
