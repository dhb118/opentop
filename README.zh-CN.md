# Iron Ridge / 铁脊行动

[English](README.md) | [简体中文](README.zh-CN.md)

Iron Ridge 是一款用 TypeScript + Three.js 实现的浏览器 3D 坦克战场。项目目标是做成一个可玩、可读、可扩展的坦克游戏模板：免费 CC0 3D 资产、真实感履带物理、bot 对战，以及无需后端的同源房间联机原型。

## 当前可玩内容

- 二战风格 3D 战场：已接入 Quaternius CC0 GLB 坦克、战壕、沙袋和废墟资产。
- 坦克物理：质量、引擎力、履带牵引、地形阻力、碰撞反弹、炮弹初速和边界约束。
- 多视角操控：车长追踪、炮手瞄准、驾驶舱、战术俯视。
- 单人演训：与 5 辆 bot 坦克对战。
- 同源联机：同一浏览器打开两个标签页，输入相同房间码即可同步坦克状态。
- 中文友好 HUD：装甲、击毁、速度、航向、履带地面、视角、资产加载状态和对局名单。

## 本地运行

```bash
pnpm install
pnpm dev
```

验证命令：

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 操作

- 驾驶：`WASD` 或方向键
- 炮塔：`Q` / `E`
- 开火：`Space` 或鼠标点击
- 鼠标瞄准：在战场画面上移动鼠标
- 切换视角：`C` 或 HUD 上的视角按钮

## 资产来源

战场使用从 Poly Pizza / Quaternius 下载的免费 CC0 GLB 资产。详见 [资产说明](public/assets/ATTRIBUTION.md)。

## 文档

- [坦克世界说明](docs/TANK_WORLD.md)

## 路线图

1. 增加权威 WebSocket 对战服务器。
2. 增加目标点、出生保护、计时器和 bot 难度。
3. 增加移动端控制和手柄输入。
4. 增加车体、炮塔、装甲、涂装和载荷自定义。
5. 增加回放或高光导出，便于发布传播。
6. 等 GitHub Pages workflow 部署完成后，重新验证公开 demo 地址。

## 许可

MIT
