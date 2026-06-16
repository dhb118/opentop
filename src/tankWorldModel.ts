export type TankMode = "single" | "multiplayer";

export type TankControlAction = "forward" | "reverse" | "turnLeft" | "turnRight" | "turretLeft" | "turretRight" | "fire";

export type TankCameraMode = "commander" | "gunner" | "driver" | "tactical";

export type TerrainSurface = "field" | "road" | "mud" | "rubble";

export interface ArenaPoint {
  x: number;
  z: number;
}

export interface TankPhysicsState {
  position: ArenaPoint;
  heading: number;
  linearVelocity: number;
  angularVelocity: number;
}

export interface TankPhysicsInput {
  throttle: number;
  turn: number;
  blocked?: boolean;
  surfaceGrip?: number;
  dragMultiplier?: number;
}

export interface TankPhysicsConfig {
  mass: number;
  engineForce: number;
  brakeForce: number;
  turnTorque: number;
  linearDrag: number;
  angularDrag: number;
  rebound: number;
}

export interface ScoreboardEntry {
  id: string;
  callsign: string;
  health: number;
  score: number;
  kind: "player" | "bot" | "peer";
}

export interface TerrainSurfaceProfile {
  label: string;
  grip: number;
  dragMultiplier: number;
  dust: number;
}

export const tankArenaSize = 96;
export const defaultTankRoom = "RIDGE-01";
export const multiplayerRoomStorageKey = "iron-ridge-room";
export const tankShellSpeed = 46;
export const tankShellGravity = 18;
export const tankShellMuzzleLift = 7.2;
export const tankBlastRadius = 5.4;
export const tankRecoilImpulse = 5.4;
export const tankCameraModes: TankCameraMode[] = ["commander", "gunner", "driver", "tactical"];
export const defaultTankCameraMode: TankCameraMode = "commander";

export const defaultTankPhysics: TankPhysicsConfig = {
  mass: 18,
  engineForce: 44,
  brakeForce: 34,
  turnTorque: 5.6,
  linearDrag: 2.8,
  angularDrag: 4.2,
  rebound: 0.34
};

export const terrainSurfaceProfiles: Record<TerrainSurface, TerrainSurfaceProfile> = {
  field: {
    label: "荒野",
    grip: 0.96,
    dragMultiplier: 1,
    dust: 0.38
  },
  road: {
    label: "硬土路",
    grip: 1.08,
    dragMultiplier: 0.9,
    dust: 0.22
  },
  mud: {
    label: "泥地",
    grip: 0.56,
    dragMultiplier: 1.78,
    dust: 0.08
  },
  rubble: {
    label: "瓦砾",
    grip: 0.74,
    dragMultiplier: 1.32,
    dust: 0.5
  }
};

const controlKeys = new Map<string, TankControlAction>([
  ["w", "forward"],
  ["arrowup", "forward"],
  ["s", "reverse"],
  ["arrowdown", "reverse"],
  ["a", "turnLeft"],
  ["arrowleft", "turnLeft"],
  ["d", "turnRight"],
  ["arrowright", "turnRight"],
  ["q", "turretLeft"],
  ["e", "turretRight"],
  [" ", "fire"]
]);

export function normalizeRoomCode(value: string): string {
  const normalized = value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/--+/g, "-")
    .slice(0, 12);
  return normalized || defaultTankRoom;
}

export function actionForTankKey(key: string): TankControlAction | null {
  return controlKeys.get(key.toLowerCase()) ?? null;
}

export function normalizeTankCameraMode(value: string | null | undefined): TankCameraMode {
  return tankCameraModes.includes(value as TankCameraMode) ? (value as TankCameraMode) : defaultTankCameraMode;
}

export function clampArenaPoint(point: ArenaPoint, arenaSize = tankArenaSize): ArenaPoint {
  const limit = arenaSize / 2 - 3;
  return {
    x: Math.max(-limit, Math.min(limit, point.x)),
    z: Math.max(-limit, Math.min(limit, point.z))
  };
}

export function shellDamageForDistance(distance: number): number {
  if (distance <= 1.6) {
    return 42;
  }
  if (distance <= 3.2) {
    return 24;
  }
  if (distance <= tankBlastRadius) {
    return 10;
  }
  return 0;
}

export function stepShellVerticalVelocity(verticalVelocity: number, dt: number, gravity = tankShellGravity): number {
  const safeDt = Math.max(0, Math.min(dt, 0.05));
  return verticalVelocity - gravity * safeDt;
}

export function shellHeightAfterStep(height: number, verticalVelocity: number, dt: number): number {
  const safeDt = Math.max(0, Math.min(dt, 0.05));
  return height + stepShellVerticalVelocity(verticalVelocity, safeDt) * safeDt;
}

export function terrainSurfaceForPoint(point: ArenaPoint): TerrainSurface {
  const roadWidth = 5.8;
  if (Math.abs(point.x) < roadWidth || Math.abs(point.z + 7) < roadWidth) {
    return "road";
  }

  const mudCraters = [
    { x: -32, z: 18, radius: 9.5 },
    { x: 27, z: -12, radius: 8.5 },
    { x: 12, z: 30, radius: 7.2 }
  ];
  if (mudCraters.some((crater) => Math.hypot(point.x - crater.x, point.z - crater.z) <= crater.radius)) {
    return "mud";
  }

  const rubbleZones = [
    { x: -24, z: -16, sx: 16, sz: 12 },
    { x: 24, z: 19, sx: 18, sz: 12 },
    { x: 0, z: 0, sx: 12, sz: 12 }
  ];
  if (
    rubbleZones.some(
      (zone) => Math.abs(point.x - zone.x) <= zone.sx / 2 && Math.abs(point.z - zone.z) <= zone.sz / 2
    )
  ) {
    return "rubble";
  }

  return "field";
}

export function applyTankRecoil(
  state: TankPhysicsState,
  turretHeading: number,
  impulse = tankRecoilImpulse,
  config: TankPhysicsConfig = defaultTankPhysics
): TankPhysicsState {
  const relativeHeading = turretHeading - state.heading;
  const reverseDriveImpulse = Math.cos(relativeHeading) * (impulse / config.mass);
  const yawImpulse = Math.sin(relativeHeading) * (impulse / config.mass) * 0.18;

  return {
    ...state,
    linearVelocity: state.linearVelocity - reverseDriveImpulse,
    angularVelocity: state.angularVelocity - yawImpulse
  };
}

export function stepTankPhysics(
  state: TankPhysicsState,
  input: TankPhysicsInput,
  dt: number,
  config: TankPhysicsConfig = defaultTankPhysics
): TankPhysicsState {
  const safeDt = Math.max(0, Math.min(dt, 0.05));
  const throttle = clamp(input.throttle, -1, 1);
  const turn = clamp(input.turn, -1, 1);
  const surfaceGrip = clamp(input.surfaceGrip ?? 1, 0.25, 1.4);
  const dragMultiplier = clamp(input.dragMultiplier ?? 1, 0.5, 2.4);
  const driveForce = (throttle >= 0 ? throttle * config.engineForce : throttle * config.brakeForce) * surfaceGrip;
  const acceleration = driveForce / config.mass - state.linearVelocity * config.linearDrag * 0.1 * dragMultiplier;
  const angularAcceleration =
    (turn * config.turnTorque * surfaceGrip * (0.35 + Math.min(Math.abs(state.linearVelocity) / 12, 1))) /
      config.mass -
    state.angularVelocity * config.angularDrag * 0.1 * dragMultiplier;
  let linearVelocity = state.linearVelocity + acceleration * safeDt;
  let angularVelocity = state.angularVelocity + angularAcceleration * safeDt;

  if (Math.abs(throttle) < 0.04 && Math.abs(linearVelocity) < 0.08) {
    linearVelocity = 0;
  }
  if (Math.abs(turn) < 0.04 && Math.abs(angularVelocity) < 0.015) {
    angularVelocity = 0;
  }

  if (input.blocked) {
    linearVelocity = -linearVelocity * config.rebound;
    angularVelocity = -angularVelocity * 0.45;
  }

  const heading = state.heading + angularVelocity * safeDt;
  const next = clampArenaPoint({
    x: state.position.x + Math.sin(heading) * linearVelocity * safeDt,
    z: state.position.z + Math.cos(heading) * linearVelocity * safeDt
  });

  return {
    position: next,
    heading,
    linearVelocity,
    angularVelocity
  };
}

export function buildCallsign(seed: string): string {
  const compact = seed.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  return `Ridge-${compact || "01"}`;
}

export function sortScoreboard(entries: ScoreboardEntry[]): ScoreboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || b.health - a.health || a.callsign.localeCompare(b.callsign));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
