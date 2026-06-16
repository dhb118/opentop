# Iron Ridge 3D Tank World

Iron Ridge is a TypeScript web tank arena built on Three.js.

## Current Slice

- Default route: opens the 3D tank arena.
- Single player: fight five bot tanks on a walled arena with cover blocks.
- Multiplayer: use a room code and open another same-origin browser tab to sync peer tank movement through `BroadcastChannel`.
- Combat loop: drive, rotate turret, fire shells, take damage, respawn, and score kills.
- Controls: `WASD` or arrow keys to drive, `Q` / `E` for turret rotation, mouse aim, mouse click or `Space` to fire.

## Physics System

The tank movement is driven by a small deterministic physics model in `src/tankWorldModel.ts`:

- mass-based acceleration,
- separate engine and reverse/brake force,
- linear drag,
- angular drag,
- differential-style turning torque,
- rebound response for blocked movement,
- arena boundary clamping,
- constant shell velocity and distance-based shell damage.

## Multiplayer Boundary

The current multiplayer mode is intentionally serverless. It works for same-origin tabs and is useful for validating the client prediction, HUD, room flow, and rendering loop before adding a backend.

Production multiplayer still needs:

- authoritative match server,
- room lifecycle and matchmaking,
- server-side hit validation,
- latency smoothing,
- reconnect handling,
- anti-cheat checks.

## Next Product Milestones

1. Add a WebSocket match server with authoritative tank state.
2. Add bot difficulty, objectives, and match timer.
3. Add mobile controls and gamepad support.
4. Add garage customization: tank hull, turret, paint, and ability loadouts.
5. Add shareable replay GIF or short highlight export for launch posts.
6. Rebrand repository metadata, README, social preview, screenshots, and topics around the tank game.
7. Publish a public demo build and smoke it in a browser.

## Star Growth Path

Iron Ridge can earn GitHub attention if it becomes a tiny but complete browser multiplayer game template:

- no backend required for the first playable demo,
- real Three.js scene instead of a static mock,
- readable TypeScript systems for movement, shells, bots, rooms, and HUD,
- clear path from local prototype to authoritative multiplayer,
- easy issues for new contributors: maps, tanks, weapons, bots, netcode, mobile controls.
