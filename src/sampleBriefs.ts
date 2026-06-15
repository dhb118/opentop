import type { OpportunityInput } from "./domain";

export interface SampleBrief {
  id: string;
  title: string;
  input: OpportunityInput;
}

export const sampleBriefs: SampleBrief[] = [
  {
    id: "local-model-debugger",
    title: "Local model debugger",
    input: {
      audience: "developers building with Ollama, llama.cpp, and local model wrappers",
      signal:
        "Local AI stacks are powerful but difficult to debug. Developers need a small tool that captures prompt, model, parameters, latency, and output drift.",
      constraints: "TypeScript, local-first, no cloud account, browser UI, exportable runs",
      channels: "GitHub, Reddit r/LocalLLaMA, Hacker News, Discord communities",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "agent-trace-notebook",
    title: "Agent trace notebook",
    input: {
      audience: "developers building AI agents and workflow automations",
      signal:
        "Agent failures are hard to explain because tool calls, intermediate state, retries, and model outputs are scattered across logs.",
      constraints: "TypeScript, file-based storage, Markdown export, works with any framework",
      channels: "GitHub, AI engineering newsletters, X/Twitter demos, framework Discords",
      pain: 8,
      urgency: 9,
      distribution: 7
    }
  },
  {
    id: "prompt-regression-lab",
    title: "Prompt regression lab",
    input: {
      audience: "product engineers shipping LLM features",
      signal:
        "Teams change prompts often but lack lightweight regression checks for important user scenarios, tone, refusal behavior, and JSON shape.",
      constraints: "TypeScript, CLI plus web UI, supports OpenAI-compatible APIs and local mock mode",
      channels: "GitHub, DevTools communities, Product Hunt, engineering blogs",
      pain: 8,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "readme-positioning-assistant",
    title: "README positioning assistant",
    input: {
      audience: "open-source maintainers launching developer tools",
      signal:
        "Useful repositories get ignored when the README fails to explain the wedge, install path, screenshot, and first successful outcome in the first screen.",
      constraints: "TypeScript, no backend, paste existing README, export patch suggestions",
      channels: "GitHub, Hacker News, maintainer communities, launch newsletters",
      pain: 7,
      urgency: 7,
      distribution: 9
    }
  },
  {
    id: "rag-fixture-builder",
    title: "RAG fixture builder",
    input: {
      audience: "engineers building retrieval-augmented generation features for support, docs, and internal knowledge bases",
      signal:
        "Teams ship RAG prototypes quickly but struggle to create repeatable fixtures that catch retrieval drift, citation mistakes, stale chunks, and prompt changes before customers notice.",
      constraints: "TypeScript, local document fixtures, works with any vector database, exports JSONL test cases",
      channels: "GitHub, LangChain and LlamaIndex communities, AI engineering newsletters, DevTools Slack groups",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "llm-cost-watch",
    title: "LLM cost watch",
    input: {
      audience: "startup engineers and maintainers running OpenAI-compatible, Anthropic, and local model workloads",
      signal:
        "Small teams lose track of token spend, latency, fallback behavior, and provider mix across AI features because logs are fragmented and dashboards are too heavyweight.",
      constraints: "TypeScript, browser dashboard, CSV import, no hosted backend, redacts prompts by default",
      channels: "GitHub, SaaS engineering blogs, Hacker News, FinOps communities, X/Twitter demos",
      pain: 8,
      urgency: 9,
      distribution: 8
    }
  },
  {
    id: "provider-migration-copilot",
    title: "Provider migration copilot",
    input: {
      audience: "developers moving AI apps between OpenAI-compatible APIs, Anthropic, Ollama, OpenRouter, and cloud gateways",
      signal:
        "AI teams need to switch providers for cost, latency, compliance, or model quality, but each migration breaks request shapes, streaming behavior, JSON mode, tool calls, and eval baselines.",
      constraints: "TypeScript, adapter checklist, request diff viewer, no secrets stored, generates migration issues",
      channels: "GitHub, provider Discords, AI SDK communities, Reddit r/LocalLLaMA, developer newsletters",
      pain: 8,
      urgency: 8,
      distribution: 9
    }
  },
  {
    id: "agent-permission-simulator",
    title: "Agent permission simulator",
    input: {
      audience: "developers adding tool-using agents to internal apps, CLIs, and developer workflows",
      signal:
        "Agent products need clear permission boundaries, but teams often discover risky file, shell, browser, or API actions only after a bad tool call reaches production.",
      constraints: "TypeScript, local-only policy simulator, scenario fixtures, Markdown reports, no live destructive actions",
      channels: "GitHub, security engineering communities, AI agent newsletters, Hacker News, framework Discords",
      pain: 9,
      urgency: 8,
      distribution: 7
    }
  },
  {
    id: "eval-report-publisher",
    title: "Eval report publisher",
    input: {
      audience: "AI product teams that run prompt, model, or agent evaluations but struggle to communicate results",
      signal:
        "Evaluation runs often stay trapped in notebooks or vendor dashboards. Teams need a lightweight way to turn eval outputs into readable changelogs, scorecards, and GitHub-ready release notes.",
      constraints: "TypeScript, imports JSON/CSV eval runs, static HTML export, share cards, works without a model API",
      channels: "GitHub, Product Hunt, AI engineering blogs, DevTools communities, maintainer newsletters",
      pain: 7,
      urgency: 8,
      distribution: 9
    }
  },
  {
    id: "agent-memory-inspector",
    title: "Agent memory inspector",
    input: {
      audience: "developers shipping long-running agents with vector memory, summaries, and user-specific context",
      signal:
        "Agent memory failures are subtle: stale facts, over-retained private data, duplicate memories, and missing citations often surface only after users complain.",
      constraints: "TypeScript, local-first inspection UI, imports JSON logs, redacts sensitive values, exports reproducible memory bug reports",
      channels: "GitHub, AI agent communities, security engineering newsletters, Hacker News, framework Discords",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "local-vector-index-doctor",
    title: "Local vector index doctor",
    input: {
      audience: "engineers running local RAG prototypes with SQLite, LanceDB, Chroma, or file-backed vector indexes",
      signal:
        "Local retrieval demos often decay when chunks change, embeddings are regenerated, filters break, or index files drift from the source documents.",
      constraints: "TypeScript, no hosted backend, scans local index metadata, compares source files, writes repair checklists",
      channels: "GitHub, Reddit r/LocalLLaMA, LangChain communities, docs engineering forums, DevTools newsletters",
      pain: 8,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "model-routing-playground",
    title: "Model routing playground",
    input: {
      audience: "developers deciding when to route requests between cheap, fast, local, and high-quality models",
      signal:
        "Teams want smaller model bills without degrading user-visible answers, but routing experiments are scattered across spreadsheets, logs, and provider dashboards.",
      constraints: "TypeScript, local demo mode, imports request samples, compares latency/cost/quality notes, no secrets in exports",
      channels: "GitHub, SaaS engineering blogs, AI infrastructure newsletters, FinOps communities, X/Twitter demos",
      pain: 8,
      urgency: 9,
      distribution: 8
    }
  },
  {
    id: "ai-release-risk-reviewer",
    title: "AI release risk reviewer",
    input: {
      audience: "engineering teams preparing releases that change prompts, models, retrieval data, or agent tools",
      signal:
        "AI releases fail in ways normal changelogs miss: prompt regressions, changed refusal behavior, broken JSON contracts, and new tool permissions.",
      constraints: "TypeScript, imports release notes and eval summaries, produces GitHub checklist, works without model API",
      channels: "GitHub, DevOps communities, AI engineering newsletters, internal platform teams, Hacker News",
      pain: 8,
      urgency: 8,
      distribution: 7
    }
  },
  {
    id: "support-thread-signal-miner",
    title: "Support thread signal miner",
    input: {
      audience: "founders and maintainers turning support tickets, Discord threads, and GitHub discussions into AI product ideas",
      signal:
        "Useful product signals are buried in repeated setup questions, confusing errors, integration requests, and workaround threads across support channels.",
      constraints: "TypeScript, paste-only import, local clustering, no customer data upload, exports opportunity briefs and starter issues",
      channels: "GitHub, founder communities, support engineering blogs, Product Hunt, developer newsletters",
      pain: 8,
      urgency: 7,
      distribution: 9
    }
  },
  {
    id: "mcp-server-contract-tester",
    title: "MCP server contract tester",
    input: {
      audience: "developers exposing internal tools, data sources, and automation APIs through MCP servers",
      signal:
        "MCP servers are easy to prototype but hard to trust because schema drift, auth assumptions, tool side effects, and model-facing descriptions often break after small changes.",
      constraints: "TypeScript, local test harness, records tool schemas, mocks dangerous calls, exports GitHub-ready regression reports",
      channels: "GitHub, MCP communities, AI agent newsletters, DevTools blogs, Hacker News",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "ai-coding-agent-pr-triage",
    title: "AI coding agent PR triage",
    input: {
      audience: "open-source maintainers receiving AI-generated pull requests, issue fixes, and automated refactors",
      signal:
        "Maintainers need a fast way to separate useful AI-generated contributions from risky churn, missing tests, broad rewrites, and changes that ignore project conventions.",
      constraints: "TypeScript, GitHub issue and diff import, local scoring, no repository write access, exports review checklists",
      channels: "GitHub, maintainer communities, AI coding newsletters, DevTools forums, Hacker News",
      pain: 8,
      urgency: 8,
      distribution: 9
    }
  }
];
