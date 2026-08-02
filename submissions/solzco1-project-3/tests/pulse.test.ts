import assert from "node:assert/strict";
import test from "node:test";
import { profileUrl, URLS } from "../lib/config";
import { getBuilder, publicBuilders } from "../lib/roster";
import { SHOWCASE_PROJECTS } from "../lib/projects";

test("roster includes 20 public builders", () => {
  const builders = publicBuilders();
  assert.equal(builders.length, 20);
  assert.ok(getBuilder("solzco1"));
  assert.ok(getBuilder("zukhriddingit"));
});

test("profileUrl builds canonical paths", () => {
  const url = profileUrl("solzco1");
  assert.ok(url.endsWith("/builders/solzco1"));
});

test("showcase projects have deploy and repo links", () => {
  for (const p of SHOWCASE_PROJECTS) {
    assert.ok(p.deployUrl.startsWith("http"));
    assert.ok(p.repoUrl.startsWith("http"));
    assert.ok(p.architecture.length >= 3);
  }
});

test("winning PM URL is configured", () => {
  assert.ok(URLS.winningPm.includes("forth"));
});
