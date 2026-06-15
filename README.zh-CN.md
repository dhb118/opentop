# OpenTop

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/dhb118/opentop/actions/workflows/ci.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/ci.yml)
[![Pages](https://github.com/dhb118/opentop/actions/workflows/pages.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-d8ff4f.svg)](LICENSE)

![OpenTop 界面截图：AI Opportunity Radar、示例简报和机会图库](docs/assets/opentop-app-screenshot.png)

OpenTop 是面向 AI 开发者的选题雷达：把零散趋势、issue、链接和产品想法，变成可比较的开源 AI 应用方向。

输入一组研究信号后，它会给出三类结果：

- 候选选题：按痛点、紧迫性、分发路径、可构建性和 Star 潜力排序。
- 首版方案：说明目标用户、MVP 范围、验证步骤和主要风险。
- 发布素材：生成 README 简报、公开发布简报、Launch Kit、Star 增长计划和 starter repo ZIP。

默认本地运行，不需要 API Key；需要更强生成能力时，可接入 OpenAI 兼容接口、Anthropic、Bedrock、Vertex AI 或 Ollama。

在线演示暂不可用：GitHub Pages custom domain 仍在修复中。请先用下方命令本地运行，或用 [Demo 备用部署](docs/DEMO_FALLBACKS.md) 发布 Vercel/Netlify/静态 ZIP 版本。

示例输出：[机会图库](docs/GALLERY.md) | [AI 仓库基准](docs/BENCHMARKS.md)

发布资料：[GitHub 发布指南](docs/GITHUB_PUBLISH.md) | [Demo 备用部署](docs/DEMO_FALLBACKS.md) | [Cloudflare Pages 直传](docs/CLOUDFLARE_PAGES.md) | [公开发布简报](docs/PUBLIC_LAUNCH_BRIEF.md) | [新手任务](docs/STARTER_ISSUES.md) | [发布手册](docs/LAUNCH_PLAYBOOK.md)

## 发布证据

- Demo 状态：GitHub Pages 仍不稳定，因此仓库已准备 Vercel、Netlify、Cloudflare Pages 直传、`gh-pages` 分支部署和静态 ZIP 备用路径。
- 本地验证：`pnpm test`、`pnpm build`、`pnpm smoke:launch-exports` 和 `pnpm package:demo` 会在公开 demo 链接前验证生产应用和发布导出能力。
- 示例验证：机会图库包含 14 个内置 AI 开发者简报，覆盖本地模型、Agent、RAG、eval、Provider 迁移、发布风险和 README 定位。
- 导出验证：生产 bundle smoke check 会确认 `Copy Launch Brief`、`Copy Launch Kit`、`Copy Star Plan` 和 `Download Repo ZIP` 可渲染。
- 发布验证：公开发布简报、新手任务和发布手册会同步 demo 状态、贡献入口和分发文案。

## 适合谁

- 想从 AI 趋势里快速筛选开源项目方向的开发者。
- 需要把用户反馈、issue 或调研笔记整理成产品机会的维护者。
- 想在发布前准备 demo、README、贡献入口和增长计划的团队。

## 核心能力

- 导入 CSV、Markdown、笔记、书签、链接列表和公开 GitHub issue。
- 生成多个 AI 应用方向，并用透明评分解释为什么值得做或不值得做。
- 使用内置示例快速测试本地模型、Agent、RAG、eval、Provider 迁移、发布风险和 README 定位等场景。
- 使用评分模板切换策略，例如本地优先工具、Provider SDK、Agent 调试和发布生成器。
- 导出 README 简报、公开发布简报、Launch Kit、Star 增长计划、仓库展示包、贡献者 issue 队列和社媒发布草稿。
- 下载 PNG/SVG 分享卡片和可运行的 TypeScript starter repo ZIP。
- 审计公开 GitHub README，给出 7 天修复冲刺计划。
- 对比公开 AI 仓库的成功模式，辅助判断一个想法是否值得继续投入。
- 支持演示模式、OpenAI 兼容接口、Anthropic、Bedrock、Vertex AI 和 Ollama。

## 快速开始

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

本地质量检查：

```bash
pnpm generate:gallery
pnpm generate:benchmarks
pnpm sync:labels
pnpm test
pnpm build
pnpm smoke:launch-exports
pnpm package:demo
pnpm check:publish
```

GitHub Pages 或备用托管恢复后再运行：

```bash
pnpm smoke:pages -- --url https://YOUR-DEMO-URL/
```

## 模型配置

OpenTop 默认使用本地演示模式。要接入模型，在应用里打开 **Model Settings**。

| Provider | 默认 endpoint | 默认模型 |
| --- | --- | --- |
| OpenAI-compatible | `https://api.openai.com/v1/chat/completions` | `gpt-4.1-mini` |
| Anthropic | `https://api.anthropic.com/v1/messages` | `claude-sonnet-4-5` |
| Anthropic on Bedrock | `https://bedrock-mantle.us-east-1.api.aws/anthropic/v1/messages` | `anthropic.claude-haiku-4-5` |
| Anthropic on Vertex AI | `https://global-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/anthropic/models/MODEL:rawPredict` | `claude-haiku-4-5@20251001` |
| Ollama | `http://localhost:11434/v1/chat/completions` | `llama3.1` |

API Key 只保存在浏览器本地设置里，不会提交到仓库。使用 Vertex AI 时请先替换 `PROJECT_ID`；使用 Ollama 时先运行 `ollama serve` 并拉取模型，例如 `ollama pull llama3.1`。

## Star 增长计划

1. 恢复可访问的在线 demo 或备用 demo，并录制 90 秒演示视频。
2. 持续维护来自真实 AI 开发痛点的高质量示例简报。
3. 持续开放适合新贡献者的 issue：评分器、导出格式、Provider、示例和文档。
4. 导出 GitHub 仓库展示包，提前准备 About 描述、topics、homepage、社交预览和 pinned issue。
5. 运行 README Star Audit，并在大范围发布前复制 7 天修复冲刺计划。
6. 为最强机会导出 Star 增长计划，按 1、10、100、1k、10k stars 分阶段执行。
7. 用 Launch Kit 准备 Hacker News、Product Hunt、Reddit 和开发者 newsletter 发布素材。
8. 写公开构建日志，说明如何在写代码前判断一个 AI 应用想法是否值得做。
9. 持续维护机会图库和 README 审计能力，让示例和工具本身一起带来 stars。

## README 语言

- [English](README.md)：GitHub 默认入口。
- [简体中文](README.zh-CN.md)：同步核心介绍、安装、模型配置和增长计划。

面向用户的功能或设置说明变更时，请同步更新两份 README。

## 许可证

MIT
