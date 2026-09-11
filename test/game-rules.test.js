import test from "node:test";
import assert from "node:assert/strict";
import { CASH_CANNON_DURATION_MS, enemyPoints, shotProfile, waveRows } from "../src/game-rules.js";

test("waves scale from three to five formation rows", () => {
  assert.equal(waveRows(1), 3);
  assert.equal(waveRows(4), 5);
  assert.equal(waveRows(99), 5);
});

test("higher formation rows provide greater rewards", () => {
  assert.equal(enemyPoints(3, 0), 30);
  assert.equal(enemyPoints(3, 2), 10);
});

test("cash cannon is a faster, stronger temporary shot", () => {
  const standard = shotProfile(false);
  const cash = shotProfile(true);
  assert.equal(CASH_CANNON_DURATION_MS, 8_000);
  assert.equal(cash.damage, 2);
  assert.ok(cash.cooldownMs < standard.cooldownMs);
});
