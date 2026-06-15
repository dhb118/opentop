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
  }
];
