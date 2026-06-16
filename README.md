# Iron Ridge

[English](README.md) | [简体中文](README.zh-CN.md)

Iron Ridge is a TypeScript + Three.js 3D tank arena for the browser. It starts as a playable WebGL prototype with a real physics layer, bot skirmishes, shell combat, and same-origin multiplayer rooms.

## Current Game

- Three.js 3D battlefield with ground grid, walls, cover blocks, tanks, turrets, and shells.
- Tank physics model with mass, engine force, drag, differential turning, rebound collisions, and arena clamping.
- Single-player mode with five bot tanks.
- Multiplayer room mode using `BroadcastChannel` for two same-origin tabs.
- HUD for armor, kills, room status, and roster.
- Controls: `WASD` or arrow keys to drive, `Q` / `E` to rotate the turret, `Space` or mouse click to fire.

## Run

```bash
pnpm install
pnpm dev
```

Build and verify:

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Documentation

- [Tank world brief](docs/TANK_WORLD.md)

## Roadmap

1. Add an authoritative WebSocket match server.
2. Add match timer, objectives, spawn protection, and bot difficulty.
3. Add mobile controls and gamepad input.
4. Add tank hull, turret, armor, and paint customization.
5. Add replay or highlight export for launch sharing.
6. Rebrand repository metadata and public demo links around Iron Ridge.

## License

MIT
