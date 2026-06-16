export type TankMode = "single" | "multiplayer";

export type TankControlAction = "forward" | "reverse" | "turnLeft" | "turnRight" | "turretLeft" | "turretRight" | "fire";

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

export const tankArenaSize = 96;
export const defaultTankRoom = "RIDGE-01";
export const multiplayerRoomStorageKey = "iron-ridge-room";
export const tankShellSpeed = 46;

export const defaultTankPhysics: TankPhysicsConfig = {
  mass: 18,
  engineForce: 44,
  brakeForce: 34,
  turnTorque: 5.6,
  linearDrag: 2.8,
  angularDrag: 4.2,
  rebound: 0.34
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

export function clampArenaPoint(point: ArenaPoint, arenaSize = tankArenaSize): ArenaPoint {
  const limit = arenaSize / 2 - 3;
  return {
    x: Math.max(-limit, Math.min(limit, point.x)),
    z: Math.max(-limit, Math.min(limit, point.z))
  };
}

export function shellDamageForDistance(distance: number): number {
  if (distance <= 1.7) {
    return 34;
  }
  if (distance <= 2.7) {
    return 18;
  }
  return 0;
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
  const driveForce = throttle >= 0 ? throttle * config.engineForce : throttle * config.brakeForce;
  const acceleration = driveForce / config.mass - state.linearVelocity * config.linearDrag * 0.1;
  const angularAcceleration =
    (turn * config.turnTorque * (0.35 + Math.min(Math.abs(state.linearVelocity) / 12, 1))) / config.mass -
    state.angularVelocity * config.angularDrag * 0.1;
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
