import test from "node:test";
import assert from "node:assert/strict";
import { pkceChallenge, randomUrlSafe, isNonHeartbeat } from "../lib/ludwitt/crypto.ts";
import { getLesson, LESSONS } from "../lib/lessons.ts";

test("pkce challenge is url-safe base64", () => {
  const verifier = randomUrlSafe(48);
  const challenge = pkceChallenge(verifier);
  assert.match(challenge, /^[A-Za-z0-9_-]+$/);
  assert.notEqual(challenge, verifier);
});

test("non-heartbeat events exclude session_heartbeat", () => {
  assert.equal(isNonHeartbeat("lesson_started"), true);
  assert.equal(isNonHeartbeat("session_heartbeat"), false);
});

test("lessons include enterprise sales module", () => {
  assert.equal(LESSONS.length, 3);
  assert.ok(getLesson("discovery"));
  assert.ok(getLesson("value-case"));
  assert.ok(getLesson("negotiation"));
});
