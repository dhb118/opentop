# OpenTop

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/dhb118/opentop/actions/workflows/ci.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/ci.yml)
[![Pages](https://github.com/dhb118/opentop/actions/workflows/pages.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-d8ff4f.svg)](LICENSE)

![OpenTop 界面截图：AI Opportunity Radar、示例简报和机会图库](docs/assets/opentop-app-screenshot.png)

OpenTop 是面向 AI 开源项目的选题雷达。它把趋势、GitHub issue、竞品链接和调研笔记，整理成可比较的项目机会，帮你判断一个想法是否值得做、先做多大、怎么发布。

输入一段市场或用户信号，OpenTop 会直接产出：

- 机会排序：按痛点、紧迫性、分发路径、可构建性和 Star 潜力打分。
- 首版范围：给出目标用户、MVP 边界、验证步骤和主要风险。
- 发布素材：生成 README 简报、Launch Kit、90 秒 demo 脚本、增长计划、Product Hunt/newsletter 草稿和 starter repo ZIP。

OpenTop 默认本地运行，不需要 API Key；需要更强生成能力时，可接入 OpenAI 兼容接口、Anthropic、Bedrock、Vertex AI 或 Ollama。

在线演示：[已验证的 rawcdn 备用 demo](https://rawcdn.githack.com/dhb118/opentop/5bb91b3f4d97f6502db365a7b3b17d908460e50d/)。当前 GitHub Actions 因账号 billing lock 无法启动，GitHub Pages 仍不可用；在 Pages 恢复前，这个固定的 `gh-pages` 构建作为公开 demo。

示例输出：[机会图库](docs/GALLERY.md) | [AI 仓库基准](docs/BENCHMARKS.md)

发布资料：[GitHub 发布指南](docs/GITHUB_PUBLISH.md) | [仓库 Profile 包](docs/REPO_PROFILE.md) | [Demo 备用部署](docs/DEMO_FALLBACKS.md) | [Cloudflare Pages 直传](docs/CLOUDFLARE_PAGES.md) | [公开发布简报](docs/PUBLIC_LAUNCH_BRIEF.md) | [发布素材包](docs/LAUNCH_MEDIA_KIT.md) | [新手任务](docs/STARTER_ISSUES.md) | [发布手册](docs/LAUNCH_PLAYBOOK.md)

## 发布证据

- Demo 状态：当前已验证的备用 demo 通过 rawcdn 托管固定的 `gh-pages` 构建；GitHub Actions 和 GitHub Pages 仍被账号 billing lock 阻塞。
- 本地验证：`pnpm test`、`pnpm build`、`pnpm smoke:launch-exports` 和 `pnpm package:demo` 会在公开 demo 链接前验证生产应用和发布导出能力。
- 示例验证：机会图库包含 14 个内置 AI 开发者简报，覆盖本地模型、Agent、RAG、eval、Provider 迁移、发布风险和 README 定位。
- 导出验证：生产 bundle smoke check 会确认 `Copy Launch Brief`、`Copy Launch Kit`、`Copy Product Hunt`、`Copy Demo Script`、`Copy Newsletter`、`Copy Star Plan` 和 `Download Repo ZIP` 可渲染。
- 发布验证：公开发布简报、新手任务、发布手册和 open issues [#11](https://github.com/dhb118/opentop/issues/11) / [#12](https://github.com/dhb118/opentop/issues/12) 会同步 demo 状态、贡献入口和分发文案。
- 仓库 Profile 验证：[仓库 Profile 包](docs/REPO_PROFILE.md) 提供发布前需要填写的 About 描述、Website、topics、pinned issue 和审计命令。
- 仓库 metadata 应用：`GITHUB_TOKEN=github_pat_... pnpm repo:profile:apply` 可在发布前同步 About 描述、homepage、issues 开关和 topics。

## 适合谁

- 想从多个 AI 应用想法里选一个先做的开发者。
- 想把 issue、用户反馈或调研笔记变成产品判断的维护者。
- 需要在发布前一次性准备 demo、README、贡献入口和传播素材的团队。

## 核心能力

- 从 CSV、Markdown、书签、链接列表和公开 GitHub issue 中提取选题信号。
- 生成多条 AI 应用方向，并解释每个方向的评分依据。
- 用评分模板切换判断标准，例如本地优先工具、Provider SDK、Agent 调试和发布生成器。
- 导出 README 简报、公开发布简报、90 秒 demo 脚本、Launch Kit、Star 增长计划、仓库 Profile 包、贡献者 issue 队列、Product Hunt 草稿和 newsletter pitch。
- 下载 PNG/SVG 分享卡片和可运行的 TypeScript starter repo ZIP。
- 审计公开 GitHub README，并给出 7 天修复冲刺计划。
- 支持本地演示模式，也可接入 OpenAI 兼容接口、Anthropic、Bedrock、Vertex AI 和 Ollama。

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
4. 应用 GitHub 仓库 Profile 包，提前准备 About 描述、topics、homepage、社交预览和 pinned issue。
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
