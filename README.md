# Iron Ridge

[English](README.md) | [简体中文](README.zh-CN.md)

Iron Ridge is a TypeScript + Three.js browser tank arena. It is built as a small, readable game template: downloaded CC0 3D assets, terrain-aware tank physics, bot combat, and same-origin multiplayer rooms without a backend.

## What You Can Play

- WWII-inspired 3D battlefield with downloaded CC0 GLB tanks, trenches, sandbags, ruins, barrels, crates, guard towers, fortified fences, and a bridge.
- Tank physics with mass, engine force, track grip, terrain drag, ballistic shells, blast impulse, directional armor, cannon recoil, collision rebound, and arena bounds.
- Battlefield feedback with track dust, shell explosions, camera kick, anti-tank hedgehogs, wire lines, fuel depots, and supply cover.
- Four camera modes: commander chase view, gunner sight, driver view, and overhead tactical view.
- Single-player skirmish against five bot tanks.
- Same-origin multiplayer prototype using `BroadcastChannel`; open two tabs with the same room code.
- Chinese-friendly sci-fi HUD with armor, kills, speed, heading, surface type, reload state, hit armor zone, camera mode, asset status, and roster.

## Run Locally

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

## Controls

- Drive: `WASD` or arrow keys
- Rotate turret: `Q` / `E`
- Fire: `Space` or mouse click
- Aim turret: mouse move over the battlefield
- Switch camera: `C` or the HUD camera buttons

## Assets

The playable battlefield uses free CC0 GLB assets downloaded from Poly Pizza / Quaternius. See [asset attribution](public/assets/ATTRIBUTION.md).

## Documentation

- [Tank world brief](docs/TANK_WORLD.md)

## Roadmap

1. Add an authoritative WebSocket match server.
2. Add objectives, spawn protection, match timer, and bot difficulty.
3. Add mobile controls and gamepad input.
4. Add tank hull, turret, armor, paint, and loadout customization.
5. Add replay or highlight export for launch sharing.
6. Re-enable and verify a public GitHub Pages demo after the Pages workflow finishes deploying.

## License

MIT
