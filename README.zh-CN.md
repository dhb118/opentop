# Iron Ridge

[English](README.md) | [简体中文](README.zh-CN.md)

Iron Ridge 是一款使用 TypeScript + Three.js 实现的浏览器 3D 坦克竞技场。当前版本是可玩的 WebGL 原型，包含坦克物理、bot 对战、炮弹战斗和同源多标签多人房间。

## 当前能力

- Three.js 3D 战场：地面网格、边界墙、掩体、坦克、炮塔和炮弹。
- 坦克物理系统：质量、引擎力、阻力、履带差速转向、碰撞反弹和场地边界限制。
- 单人模式：与 5 辆 bot 坦克对战。
- 多人房间：基于 `BroadcastChannel`，同一浏览器打开两个同源标签页即可联机验证。
- HUD：显示装甲、击毁数、房间状态和对局名单。
- 操作：`WASD` 或方向键驾驶，`Q` / `E` 转炮塔，`Space` 或鼠标点击开火。

## 运行

```bash
pnpm install
pnpm dev
```

构建和验证：

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 文档

- [坦克世界说明](docs/TANK_WORLD.md)

## 路线图

1. 增加权威 WebSocket 对战服务器。
2. 增加计时、目标点、出生保护和 bot 难度。
3. 增加移动端控制和手柄输入。
4. 增加车体、炮塔、装甲和涂装自定义。
5. 增加回放或高光导出，用于发布传播。
6. 将仓库 metadata 和公开 demo 链接全部重塑为 Iron Ridge。

## 许可

MIT
