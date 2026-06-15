# Sample Opportunity Briefs

Use these examples to test OpenTop and to show visitors what the app produces. Each brief is a concrete AI builder pain with enough context to generate ranked opportunities, launch artifacts, and starter repo ideas.

## Local model debugger

Audience: developers building with Ollama, llama.cpp, and local model wrappers.

Signal: Local AI stacks are powerful but difficult to debug. Developers need a small tool that captures prompt, model, parameters, latency, and output drift.

Constraints: TypeScript, local-first, no cloud account, browser UI, exportable runs.

Channels: GitHub, Reddit r/LocalLLaMA, Hacker News, Discord communities.

Scores: pain 9/10, urgency 8/10, distribution 8/10.

## Agent trace notebook

Audience: developers building AI agents and workflow automations.

Signal: Agent failures are hard to explain because tool calls, intermediate state, retries, and model outputs are scattered across logs.

Constraints: TypeScript, file-based storage, Markdown export, works with any framework.

Channels: GitHub, AI engineering newsletters, X/Twitter demos, framework Discords.

Scores: pain 8/10, urgency 9/10, distribution 7/10.

## Prompt regression lab

Audience: product engineers shipping LLM features.

Signal: Teams change prompts often but lack lightweight regression checks for important user scenarios, tone, refusal behavior, and JSON shape.

Constraints: TypeScript, CLI plus web UI, supports OpenAI-compatible APIs and local mock mode.

Channels: GitHub, DevTools communities, Product Hunt, engineering blogs.

Scores: pain 8/10, urgency 8/10, distribution 8/10.

## README positioning assistant

Audience: open-source maintainers launching developer tools.

Signal: Useful repositories get ignored when the README fails to explain the wedge, install path, screenshot, and first successful outcome in the first screen.

Constraints: TypeScript, no backend, paste existing README, export patch suggestions.

Channels: GitHub, Hacker News, maintainer communities, launch newsletters.

Scores: pain 7/10, urgency 7/10, distribution 9/10.

## RAG fixture builder

Audience: engineers building retrieval-augmented generation features for support, docs, and internal knowledge bases.

Signal: Teams ship RAG prototypes quickly but struggle to create repeatable fixtures that catch retrieval drift, citation mistakes, stale chunks, and prompt changes before customers notice.

Constraints: TypeScript, local document fixtures, works with any vector database, exports JSONL test cases.

Channels: GitHub, LangChain and LlamaIndex communities, AI engineering newsletters, DevTools Slack groups.

Scores: pain 9/10, urgency 8/10, distribution 8/10.

## LLM cost watch

Audience: startup engineers and maintainers running OpenAI-compatible, Anthropic, and local model workloads.

Signal: Small teams lose track of token spend, latency, fallback behavior, and provider mix across AI features because logs are fragmented and dashboards are too heavyweight.

Constraints: TypeScript, browser dashboard, CSV import, no hosted backend, redacts prompts by default.

Channels: GitHub, SaaS engineering blogs, Hacker News, FinOps communities, X/Twitter demos.

Scores: pain 8/10, urgency 9/10, distribution 8/10.

## Provider migration copilot

Audience: developers moving AI apps between OpenAI-compatible APIs, Anthropic, Ollama, OpenRouter, and cloud gateways.

Signal: AI teams need to switch providers for cost, latency, compliance, or model quality, but each migration breaks request shapes, streaming behavior, JSON mode, tool calls, and eval baselines.

Constraints: TypeScript, adapter checklist, request diff viewer, no secrets stored, generates migration issues.

Channels: GitHub, provider Discords, AI SDK communities, Reddit r/LocalLLaMA, developer newsletters.

Scores: pain 8/10, urgency 8/10, distribution 9/10.

## Agent permission simulator

Audience: developers adding tool-using agents to internal apps, CLIs, and developer workflows.

Signal: Agent products need clear permission boundaries, but teams often discover risky file, shell, browser, or API actions only after a bad tool call reaches production.

Constraints: TypeScript, local-only policy simulator, scenario fixtures, Markdown reports, no live destructive actions.

Channels: GitHub, security engineering communities, AI agent newsletters, Hacker News, framework Discords.

Scores: pain 9/10, urgency 8/10, distribution 7/10.

## Eval report publisher

Audience: AI product teams that run prompt, model, or agent evaluations but struggle to communicate results.

Signal: Evaluation runs often stay trapped in notebooks or vendor dashboards. Teams need a lightweight way to turn eval outputs into readable changelogs, scorecards, and GitHub-ready release notes.

Constraints: TypeScript, imports JSON/CSV eval runs, static HTML export, share cards, works without a model API.

Channels: GitHub, Product Hunt, AI engineering blogs, DevTools communities, maintainer newsletters.

Scores: pain 7/10, urgency 8/10, distribution 9/10.

## Agent memory inspector

Audience: developers shipping long-running agents with vector memory, summaries, and user-specific context.

Signal: Agent memory failures are subtle: stale facts, over-retained private data, duplicate memories, and missing citations often surface only after users complain.

Constraints: TypeScript, local-first inspection UI, imports JSON logs, redacts sensitive values, exports reproducible memory bug reports.

Channels: GitHub, AI agent communities, security engineering newsletters, Hacker News, framework Discords.

Scores: pain 9/10, urgency 8/10, distribution 8/10.

## Local vector index doctor

Audience: engineers running local RAG prototypes with SQLite, LanceDB, Chroma, or file-backed vector indexes.

Signal: Local retrieval demos often decay when chunks change, embeddings are regenerated, filters break, or index files drift from the source documents.

Constraints: TypeScript, no hosted backend, scans local index metadata, compares source files, writes repair checklists.

Channels: GitHub, Reddit r/LocalLLaMA, LangChain communities, docs engineering forums, DevTools newsletters.

Scores: pain 8/10, urgency 8/10, distribution 8/10.

## Model routing playground

Audience: developers deciding when to route requests between cheap, fast, local, and high-quality models.

Signal: Teams want smaller model bills without degrading user-visible answers, but routing experiments are scattered across spreadsheets, logs, and provider dashboards.

Constraints: TypeScript, local demo mode, imports request samples, compares latency/cost/quality notes, no secrets in exports.

Channels: GitHub, SaaS engineering blogs, AI infrastructure newsletters, FinOps communities, X/Twitter demos.

Scores: pain 8/10, urgency 9/10, distribution 8/10.

## AI release risk reviewer

Audience: engineering teams preparing releases that change prompts, models, retrieval data, or agent tools.

Signal: AI releases fail in ways normal changelogs miss: prompt regressions, changed refusal behavior, broken JSON contracts, and new tool permissions.

Constraints: TypeScript, imports release notes and eval summaries, produces GitHub checklist, works without model API.

Channels: GitHub, DevOps communities, AI engineering newsletters, internal platform teams, Hacker News.

Scores: pain 8/10, urgency 8/10, distribution 7/10.

## Support thread signal miner

Audience: founders and maintainers turning support tickets, Discord threads, and GitHub discussions into AI product ideas.

Signal: Useful product signals are buried in repeated setup questions, confusing errors, integration requests, and workaround threads across support channels.

Constraints: TypeScript, paste-only import, local clustering, no customer data upload, exports opportunity briefs and starter issues.

Channels: GitHub, founder communities, support engineering blogs, Product Hunt, developer newsletters.

Scores: pain 8/10, urgency 7/10, distribution 9/10.

## MCP server contract tester

Audience: developers exposing internal tools, data sources, and automation APIs through MCP servers.

Signal: MCP servers are easy to prototype but hard to trust because schema drift, auth assumptions, tool side effects, and model-facing descriptions often break after small changes.

Constraints: TypeScript, local test harness, records tool schemas, mocks dangerous calls, exports GitHub-ready regression reports.

Channels: GitHub, MCP communities, AI agent newsletters, DevTools blogs, Hacker News.

Scores: pain 9/10, urgency 8/10, distribution 8/10.

## AI coding agent PR triage

Audience: open-source maintainers receiving AI-generated pull requests, issue fixes, and automated refactors.

Signal: Maintainers need a fast way to separate useful AI-generated contributions from risky churn, missing tests, broad rewrites, and changes that ignore project conventions.

Constraints: TypeScript, GitHub issue and diff import, local scoring, no repository write access, exports review checklists.

Channels: GitHub, maintainer communities, AI coding newsletters, DevTools forums, Hacker News.

Scores: pain 8/10, urgency 8/10, distribution 9/10.
