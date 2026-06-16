# Contributing to Iron Ridge

Iron Ridge is a TypeScript and Three.js browser tank game. Contributions should make the game more playable, more reliable, or easier to extend.

## Useful Contribution Areas

- Tank physics: traction, braking, recoil, terrain friction, collision response.
- Combat: shell types, reload timing, hit feedback, armor zones, respawn rules.
- AI: bot navigation, target selection, difficulty levels, objective play.
- Multiplayer: WebSocket server, room lifecycle, server authority, interpolation, reconnects.
- Maps: cover layout, spawn safety, objectives, visual landmarks.
- Input: mobile controls, gamepad support, remapping, accessibility.
- Rendering: tank models, effects, lighting, performance, screenshots.

## Local Development

```bash
pnpm install
pnpm dev
```

Before opening a pull request:

```bash
pnpm test
pnpm typecheck
pnpm build
```

For UI or gameplay changes, include a screenshot or a short note explaining what you tested in the browser.

## Product Bar

Good changes should improve at least one of these:

- The tank feels more physical and readable.
- A new player understands the controls faster.
- Single-player bots become more interesting.
- Multiplayer moves closer to authoritative online play.
- The code remains small enough for contributors to understand.
