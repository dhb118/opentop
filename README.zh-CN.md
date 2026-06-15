# OpenTop

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/dhb118/opentop/actions/workflows/ci.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/ci.yml)
[![Pages](https://github.com/dhb118/opentop/actions/workflows/pages.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-d8ff4f.svg)](LICENSE)

![OpenTop 界面，展示 AI Opportunity Radar、示例简报和生成的机会图库](docs/assets/opentop-app-screenshot.png)

OpenTop 是一款面向构建者的 AI 机会雷达，用来选择、打磨并发布开源 AI 应用。它可以把混乱的市场信号转换成排序后的产品想法、评分、首版范围和发布计划。

这个应用以 TypeScript 为核心，无需 API Key 即可本地运行，也可以按需调用 OpenAI 兼容的 Chat Completions API、Anthropic Messages API 或 Ollama。

在线演示目标：`https://dhb118.github.io/opentop/`

示例输出：[机会图库](docs/GALLERY.md)、[AI 仓库基准](docs/BENCHMARKS.md)

发布资产：[GitHub 发布指南](docs/GITHUB_PUBLISH.md)、[新手任务](docs/STARTER_ISSUES.md)、[发布手册](docs/LAUNCH_PLAYBOOK.md)

## README 语言

- [English](README.md)：GitHub 默认入口。
- [简体中文](README.zh-CN.md)：同步产品介绍、安装、模型配置、路线图和增长计划。

面向用户的功能或设置说明变更时，请在同一个 PR 中同步两份 README。

## 为什么它有机会获得 Stars

开源 AI 项目通常在做好三件事时更容易传播：

- 给开发者一个立刻有用的工作流。
- 不依赖注册账号或额外基础设施。
- 产出别人可以展示、fork 和扩展的成果物。

OpenTop 围绕这些循环设计：粘贴趋势信号，得到排序后的应用想法，复制 GitHub 可用的简报，然后发布这个想法或扩展评分器。

## 功能

- 无需 API Key 的本地演示引擎。
- 支持 OpenAI 兼容端点。
- 内置 Anthropic Messages API 提供商预设。
- 通过 `/v1/chat/completions` 支持 Ollama 兼容端点。
- 可修复带代码围栏、噪声包装和越界评分的模型响应。
- 可编辑机会假设：痛点、紧迫性和分发能力。
- 评分矩阵覆盖痛点、紧迫性、分发、可构建性和 Star 潜力。
- 评分模板市场，覆盖本地优先工具、Provider SDK、Agent 调试和发布生成器。
- 为每个选中机会展示透明的加权评分解释。
- 可复制 Markdown 简报，用于 GitHub issues、README 片段和发布草稿。
- 可导出 README 简报、GitHub issue 正文、仓库脚手架计划、可下载的入门仓库 ZIP、Show HN 帖子、X 线程、Reddit 帖子和 JSON 机会记录。
- 可下载选中机会的 PNG 和 SVG 分享卡片。
- 可分享的简报链接会在 URL 中保留完整输入信号。
- 一键加载面向本地模型、Agent、Prompt 回归和 README 定位的示例简报。
- 应用内机会图库，包含评分示例和分享链接。
- 应用内 benchmark lesson，会把公开 AI 仓库模式映射到 OpenTop 评分维度。
- 支持从 CSV、Markdown、笔记、浏览器书签、复制的链接列表和公开 GitHub issue URL 导入研究片段，并转成信号简报。
- 使用 Vite 和 TypeScript 构建的响应式单页界面。

## 快速开始

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

运行本地质量门禁：

```bash
pnpm generate:gallery
pnpm generate:benchmarks
pnpm sync:labels
pnpm test
pnpm build
pnpm check:publish
```

GitHub Pages 部署完成后：

```bash
pnpm smoke:pages
```

## 模型设置

OpenTop 默认使用演示模式。要使用模型，请在应用中打开 **Model Settings**。

OpenAI 兼容 API：

- Provider：`OpenAI-compatible`
- Endpoint：`https://api.openai.com/v1/chat/completions`
- Model：`gpt-4.1-mini` 或其他 Chat Completions 模型

Anthropic：

- Provider：`Anthropic`
- Endpoint：`https://api.anthropic.com/v1/messages`
- Model：`claude-sonnet-4-5` 或其他 Claude Messages API 模型
- API Key：只保存在你的浏览器设置中，不会提交到仓库

Ollama：

- 运行 `ollama serve`。
- 拉取模型，例如 `ollama pull llama3.1`。
- Provider：`Ollama`
- Endpoint：`http://localhost:11434/v1/chat/completions`
- Model：`llama3.1`

## Star 增长计划

1. 发布打磨过的在线演示和 90 秒屏幕录制。
2. 基于真实 AI 开发者痛点添加五个高质量示例简报。
3. 为新的评分器、导出格式和提供商开放新手任务。
4. 提交到 Hacker News、Product Hunt、Reddit 和 AI 工程 newsletter。
5. 写一篇透明的构建日志：“我如何在写代码前选择 AI 应用想法”。
6. 持续维护公开的生成想法图库，让 Stars 通过示例持续累积。

## 许可证

MIT
