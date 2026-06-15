# OpenTop

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/dhb118/opentop/actions/workflows/ci.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/ci.yml)
[![Pages](https://github.com/dhb118/opentop/actions/workflows/pages.yml/badge.svg)](https://github.com/dhb118/opentop/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-d8ff4f.svg)](LICENSE)

![OpenTop interface showing the AI Opportunity Radar, sample briefs, and generated opportunity gallery](docs/assets/opentop-app-screenshot.png)

OpenTop is an AI opportunity radar for builders who want to choose, shape, and launch open-source AI apps. It turns a messy market signal into ranked product ideas, scoring, a first-release scope, and a launch plan.

The app is TypeScript-first, runs locally without an API key, and can optionally call OpenAI-compatible chat completion APIs, direct Anthropic Messages APIs, Anthropic on Amazon Bedrock, Anthropic on Vertex AI, or Ollama.

Live demo status: temporarily unavailable while GitHub Pages custom domain settings are being repaired. Use the Quick Start commands below or publish a temporary [fallback demo](docs/DEMO_FALLBACKS.md) on Vercel, Netlify, or any static host from the demo ZIP.

Example outputs: [Opportunity Gallery](docs/GALLERY.md), [AI Repo Benchmarks](docs/BENCHMARKS.md)

Launch assets: [GitHub Publish Guide](docs/GITHUB_PUBLISH.md), [Demo Fallbacks](docs/DEMO_FALLBACKS.md), [Cloudflare Pages Direct Upload](docs/CLOUDFLARE_PAGES.md), [Public Launch Brief](docs/PUBLIC_LAUNCH_BRIEF.md), [Starter Issues](docs/STARTER_ISSUES.md), [Launch Playbook](docs/LAUNCH_PLAYBOOK.md)

## Launch Evidence

- Demo status: GitHub Pages is not reliable yet, so the repository includes Vercel, Netlify, Cloudflare Pages Direct Upload, `gh-pages` branch deploy, and static ZIP fallback paths.
- Local proof: `pnpm test`, `pnpm build`, `pnpm smoke:launch-exports`, and `pnpm package:demo` verify the production app and its launch exports before any public demo link is shared.
- Example proof: the gallery includes 14 built-in AI builder briefs covering local models, agents, RAG, evals, provider migration, release risk, and README positioning.
- Export proof: the production bundle smoke check verifies `Copy Launch Brief`, `Copy Launch Kit`, `Copy Star Plan`, and `Download Repo ZIP`.
- Launch proof: the public launch brief, starter issues, launch playbook, and open issues [#11](https://github.com/dhb118/opentop/issues/11) / [#12](https://github.com/dhb118/opentop/issues/12) keep demo status, contributor paths, and distribution copy aligned.

## Languages

- [English](README.md) is the default GitHub landing page.
- [简体中文](README.zh-CN.md) mirrors the product overview, setup, model configuration, roadmap, and growth plan.

When user-facing setup or feature text changes, update both README files in the same pull request.

## Why It Can Earn Stars

Open-source AI projects usually spread when they do three things well:

- Give developers an immediately useful workflow.
- Work without signup or infrastructure.
- Produce artifacts people can show, fork, and extend.

OpenTop is built around those loops: paste a trend signal, get ranked app ideas, copy a GitHub-ready brief, then publish the idea or extend the scorer.

## Features

- Local demo engine for no-key analysis.
- OpenAI-compatible endpoint support.
- Anthropic provider presets for the direct Messages API, Amazon Bedrock, and Vertex AI.
- Ollama-compatible endpoint support through `/v1/chat/completions`.
- Model response repair for fenced JSON, noisy wrappers, and out-of-range scores.
- Editable opportunity assumptions: pain, urgency, and distribution.
- Score matrix for pain, urgency, distribution, buildability, and star potential.
- Scoring template marketplace for local-first tools, provider SDKs, agent debugging, and launch generators.
- Transparent weighted scoring explanation for every selected opportunity.
- Copyable Markdown brief for GitHub issues, README sections, and launch drafts.
- Export actions for README briefs, public launch briefs, launch kits, star growth plans, GitHub repo listing packs, contributor issue queues, GitHub issue bodies, repo scaffold plans, downloadable starter ZIPs, Show HN posts, X threads, Reddit posts, and JSON opportunity records.
- Downloadable PNG and SVG share cards for selected opportunities.
- Shareable brief links that preserve the full input signal in the URL.
- One-click sample briefs for local models, agents, RAG, evals, provider migration, release risk, and README positioning.
- In-app opportunity gallery with scored examples and share links.
- In-app benchmark lessons mapped to OpenTop score dimensions from public AI repos.
- Local README Star Audit that can paste or fetch a public GitHub README, then score first-screen hooks, screenshots, quick starts, demo paths, examples, contributor paths, trust signals, and repository profile metadata, with a copyable 7-day fix sprint.
- CSV, Markdown, notes, browser bookmarks, copied link lists, and public GitHub issue URL import for turning research snippets into signal briefs.
- Responsive single-page interface built with Vite and TypeScript.

## Quick Start

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run the local quality gate:

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

After GitHub Pages or a fallback host deploys:

```bash
pnpm smoke:pages -- --url https://YOUR-DEMO-URL/
```

## Model Setup

OpenTop works in demo mode by default. To use a model, open **Model Settings** in the app.

For OpenAI-compatible APIs:

- Provider: `OpenAI-compatible`
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4.1-mini` or another chat-completions model

For Anthropic:

- Provider: `Anthropic`
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-sonnet-4-5` or another Claude Messages API model
- API Key: stored only in your browser settings, never committed

For Anthropic on Amazon Bedrock:

- Provider: `Anthropic on Bedrock`
- Endpoint: `https://bedrock-mantle.us-east-1.api.aws/anthropic/v1/messages`
- Model: `anthropic.claude-haiku-4-5` or another Claude model ID available in your Bedrock region
- API Key: a short-lived Bedrock bearer token, stored only in your browser settings
- Notes: IAM and SigV4 flows should go through an SDK or trusted gateway; the browser preset targets the bearer-token Messages API path documented by Anthropic.
- Docs: [Claude in Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)

For Anthropic on Vertex AI:

- Provider: `Anthropic on Vertex AI`
- Endpoint: `https://global-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/global/publishers/anthropic/models/MODEL:rawPredict`
- Model: `claude-haiku-4-5@20251001` or another Vertex AI Claude model ID
- API Key: a Google OAuth access token, stored only in your browser settings
- Notes: replace `PROJECT_ID` before calling the model. OpenTop substitutes the `MODEL` placeholder from the Model field.
- Docs: [Claude on Vertex AI](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/partner-models/claude/use-claude)

For Ollama:

- Run `ollama serve`.
- Pull a model, for example `ollama pull llama3.1`.
- Provider: `Ollama`
- Endpoint: `http://localhost:11434/v1/chat/completions`
- Model: `llama3.1`

## Star Growth Plan

1. Publish a polished hosted demo or fallback demo and a 90-second screen recording.
2. Keep the sample brief library fresh with recognizable AI developer pains.
3. Open starter issues for new scorers, export formats, and providers.
4. Export a GitHub Repo Listing Pack so the About description, topics, homepage, social preview, and pinned issue are ready.
5. Run README Star Audit and copy the 7-day fix sprint before broad launch.
6. Export a Star Growth Plan for the strongest opportunity and use it to stage the 1, 10, 100, 1k, and 10k star loops.
7. Submit to Hacker News, Product Hunt, Reddit, and AI engineering newsletters.
8. Write a transparent build log: "How I pick AI app ideas before writing code."
9. Keep a public gallery of generated ideas so stars compound through examples.

## License

MIT
