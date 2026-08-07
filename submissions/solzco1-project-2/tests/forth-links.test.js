import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildForthTaskDeepLink,
  extractForthLinks,
  normalizePmBaseUrl,
  parseForthTaskUrl,
} from "../lib/forth-links.js";

describe("forth-links", () => {
  const base = "https://forth-bice.vercel.app";

  it("normalizes PM base URL", () => {
    assert.equal(normalizePmBaseUrl("https://forth-bice.vercel.app/"), base);
  });

  it("builds deep link with taskId", () => {
    assert.equal(
      buildForthTaskDeepLink("abc-123", base),
      "https://forth-bice.vercel.app/?taskId=abc-123",
    );
  });

  it("parses forth task URL", () => {
    const parsed = parseForthTaskUrl(
      "https://forth-bice.vercel.app/?taskId=task-9",
      base,
    );
    assert.deepEqual(parsed, { taskId: "task-9" });
  });

  it("rejects wrong origin", () => {
    assert.equal(parseForthTaskUrl("https://evil.example/?taskId=x", base), null);
  });

  it("extracts links from message text", () => {
    const text =
      "Ship it https://forth-bice.vercel.app/?taskId=one and again https://forth-bice.vercel.app/?taskId=one";
    const links = extractForthLinks(text, base);
    assert.equal(links.length, 1);
    assert.equal(links[0].taskId, "one");
  });
});
