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
  }
];
