import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  actionForTankKey,
  applyTankRecoil,
  clampArenaPoint,
  defaultTankCameraMode,
  defaultTankPhysics,
  normalizeTankCameraMode,
  normalizeRoomCode,
  shellHeightAfterStep,
  shellDamageForDistance,
  sortScoreboard,
  stepShellVerticalVelocity,
  stepTankPhysics,
  tankBlastRadius,
  tankCameraModes,
  tankArenaSize,
  tankRecoilImpulse,
  tankShellGravity,
  tankShellMuzzleLift,
  tankShellSpeed,
  terrainSurfaceForPoint,
  terrainSurfaceProfiles
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

  it("normalizes camera modes for HUD and hotkeys", () => {
    assert.deepEqual(tankCameraModes, ["commander", "gunner", "driver", "tactical"]);
    assert.equal(normalizeTankCameraMode("gunner"), "gunner");
    assert.equal(normalizeTankCameraMode("unknown"), defaultTankCameraMode);
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

  it("models terrain grip and drag for mud, roads, and rubble", () => {
    assert.equal(terrainSurfaceForPoint({ x: 0, z: 22 }), "road");
    assert.equal(terrainSurfaceForPoint({ x: -32, z: 18 }), "mud");
    assert.equal(terrainSurfaceForPoint({ x: -24, z: -16 }), "rubble");
    assert.ok(terrainSurfaceProfiles.mud.grip < terrainSurfaceProfiles.road.grip);

    const baseState = {
      position: { x: 20, z: 20 },
      heading: 0,
      linearVelocity: 0,
      angularVelocity: 0
    };
    const road = stepTankPhysics(
      baseState,
      {
        throttle: 1,
        turn: 0,
        surfaceGrip: terrainSurfaceProfiles.road.grip,
        dragMultiplier: terrainSurfaceProfiles.road.dragMultiplier
      },
      0.05
    );
    const mud = stepTankPhysics(
      baseState,
      {
        throttle: 1,
        turn: 0,
        surfaceGrip: terrainSurfaceProfiles.mud.grip,
        dragMultiplier: terrainSurfaceProfiles.mud.dragMultiplier
      },
      0.05
    );

    assert.ok(road.linearVelocity > mud.linearVelocity);
  });

  it("applies cannon recoil against the turret direction", () => {
    const baseState = {
      position: { x: 0, z: 0 },
      heading: 0,
      linearVelocity: 0,
      angularVelocity: 0
    };
    const straightShot = applyTankRecoil(baseState, 0);
    const sideShot = applyTankRecoil(baseState, Math.PI / 2);

    assert.equal(tankRecoilImpulse, 5.4);
    assert.ok(straightShot.linearVelocity < 0);
    assert.ok(Math.abs(sideShot.linearVelocity) < Math.abs(straightShot.linearVelocity));
    assert.ok(sideShot.angularVelocity < 0);
  });

  it("steps shell height with gravity for ballistic arcs", () => {
    const nextVelocity = stepShellVerticalVelocity(tankShellMuzzleLift, 0.05);
    const nextHeight = shellHeightAfterStep(1.55, tankShellMuzzleLift, 0.05);

    assert.equal(tankShellGravity, 18);
    assert.ok(nextVelocity < tankShellMuzzleLift);
    assert.ok(nextHeight > 1.55);
  });

  it("keeps tanks inside the arena and scores shell damage by hit distance", () => {
    assert.deepEqual(clampArenaPoint({ x: tankArenaSize, z: -tankArenaSize }), { x: 45, z: -45 });
    assert.equal(shellDamageForDistance(1.4), 42);
    assert.equal(shellDamageForDistance(2.4), 24);
    assert.equal(shellDamageForDistance(4.8), 10);
    assert.equal(shellDamageForDistance(6.1), 0);
    assert.equal(tankBlastRadius, 5.4);
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
