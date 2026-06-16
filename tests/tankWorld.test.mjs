import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  actionForTankKey,
  clampArenaPoint,
  defaultTankPhysics,
  normalizeRoomCode,
  shellDamageForDistance,
  sortScoreboard,
  stepTankPhysics,
  tankArenaSize,
  tankShellSpeed
} from "../src/tankWorldModel.ts";

describe("tank world controls", () => {
  it("normalizes multiplayer room codes", () => {
    assert.equal(normalizeRoomCode(" ridge 01!! "), "RIDGE01");
    assert.equal(normalizeRoomCode(""), "RIDGE-01");
    assert.equal(normalizeRoomCode("very-long-room-code"), "VERY-LONG-RO");
  });

  it("maps keyboard input to tank actions", () => {
    assert.equal(actionForTankKey("w"), "forward");
    assert.equal(actionForTankKey("ArrowLeft"), "turnLeft");
    assert.equal(actionForTankKey(" "), "fire");
    assert.equal(actionForTankKey("Escape"), null);
  });
});

describe("tank physics", () => {
  it("accelerates forward using mass and engine force", () => {
    const next = stepTankPhysics(
      {
        position: { x: 0, z: 0 },
        heading: 0,
        linearVelocity: 0,
        angularVelocity: 0
      },
      { throttle: 1, turn: 0 },
      0.05
    );

    assert.ok(next.linearVelocity > 0);
    assert.ok(next.position.z > 0);
    assert.equal(next.position.x, 0);
  });

  it("uses differential turning torque only while the tank has traction", () => {
    const next = stepTankPhysics(
      {
        position: { x: 0, z: 0 },
        heading: 0,
        linearVelocity: 8,
        angularVelocity: 0
      },
      { throttle: 1, turn: 1 },
      0.05
    );

    assert.ok(next.angularVelocity > 0);
    assert.ok(next.heading > 0);
  });

  it("applies rebound when collision is blocked", () => {
    const next = stepTankPhysics(
      {
        position: { x: 0, z: 0 },
        heading: 0,
        linearVelocity: 10,
        angularVelocity: 0.5
      },
      { throttle: 1, turn: 1, blocked: true },
      0.05
    );

    assert.ok(next.linearVelocity < 0);
    assert.ok(Math.abs(next.linearVelocity) < 10);
    assert.ok(Math.abs(next.angularVelocity) < 0.5);
  });

  it("keeps tanks inside the arena and scores shell damage by hit distance", () => {
    assert.deepEqual(clampArenaPoint({ x: tankArenaSize, z: -tankArenaSize }), { x: 45, z: -45 });
    assert.equal(shellDamageForDistance(1.4), 34);
    assert.equal(shellDamageForDistance(2.4), 18);
    assert.equal(shellDamageForDistance(3.1), 0);
    assert.equal(tankShellSpeed, 46);
    assert.equal(defaultTankPhysics.mass, 18);
  });
});

describe("scoreboard", () => {
  it("sorts by kills and surviving armor", () => {
    const rows = sortScoreboard([
      { id: "a", callsign: "Alpha", health: 20, score: 2, kind: "bot" },
      { id: "b", callsign: "Bravo", health: 90, score: 2, kind: "player" },
      { id: "c", callsign: "Charlie", health: 100, score: 1, kind: "peer" }
    ]);

    assert.deepEqual(
      rows.map((row) => row.callsign),
      ["Bravo", "Alpha", "Charlie"]
    );
  });
});
