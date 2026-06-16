# Iron Ridge 3D Tank World

Iron Ridge is a TypeScript web tank arena built on Three.js.

## Current Slice

- Default route opens the playable 3D tank arena.
- Downloaded CC0 GLB assets provide tank skins, trenches, sandbags, and modular ruins.
- Single-player mode spawns five bot tanks.
- Multiplayer mode syncs same-origin browser tabs through `BroadcastChannel`.
- Combat loop: drive, rotate turret, fire shells, take damage, respawn, and score kills.
- Camera modes: commander chase, gunner sight, driver view, and tactical overhead.
- HUD is Chinese-friendly and shows armor, kills, speed, heading, surface, camera mode, asset status, and roster.

## Physics System

The deterministic tank movement model lives in `src/tankWorldModel.ts`:

- mass-based acceleration,
- separate engine and reverse/brake force,
- linear drag,
- angular drag,
- differential-style turning torque,
- terrain grip and terrain drag,
- rebound response for blocked movement,
- arena boundary clamping,
- constant shell velocity and distance-based shell damage.

Terrain surfaces currently include field, road, mud, and rubble. The renderer reads the same surface model that the physics system uses, so the HUD and movement behavior stay aligned.

## Asset Boundary

The GLB files are stored in `public/assets/vendor/poly-pizza/`. They are treated as visual skins and scenery. Collision remains code-defined with simple boxes so gameplay stays deterministic even if a model fails to load.

See `public/assets/ATTRIBUTION.md` for source URLs and license notes.

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
6. Rebuild screenshots and public demo metadata after GitHub Pages deploys from workflow.

## Star Growth Path

Iron Ridge can earn GitHub attention if it becomes a tiny but complete browser multiplayer game template:

- no backend required for the first playable demo,
- real Three.js scene instead of a static mock,
- readable TypeScript systems for movement, shells, bots, rooms, terrain, assets, and HUD,
- clear path from local prototype to authoritative multiplayer,
- easy issues for new contributors: maps, tanks, weapons, bots, netcode, mobile controls.
