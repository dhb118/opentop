export type AiProvider =
  | "demo"
  | "openai-compatible"
  | "ollama"
  | "anthropic"
  | "anthropic-bedrock"
  | "anthropic-vertex";

export interface ProviderSettings {
  provider: AiProvider;
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface OpportunityInput {
  audience: string;
  signal: string;
  constraints: string;
  channels: string;
  pain: number;
  urgency: number;
  distribution: number;
}

export interface Opportunity {
  id: string;
  name: string;
  tagline: string;
  targetUser: string;
  wedge: string;
  differentiator: string;
  moat: string;
  score: number;
  scores: {
    pain: number;
    urgency: number;
    distribution: number;
    buildability: number;
    starPotential: number;
  };
  firstRelease: string[];
  launchPlan: string[];
  repoHook: string;
  risks: string[];
}

export interface AnalysisResult {
  summary: string;
  opportunities: Opportunity[];
  generatedBy: "local-engine" | "model";
}

export const defaultSettings: ProviderSettings = {
  provider: "demo",
  endpoint: "",
  apiKey: "",
  model: ""
};

export const defaultInput: OpportunityInput = {
  audience: "solo developers, AI engineers, and open-source maintainers",
  signal:
    "Developers are overwhelmed by fast-moving AI APIs, agent frameworks, and local model tooling. They want smaller tools that help them decide what to build, ship fast, and explain the project clearly.",
  constraints:
    "Must be TypeScript-first, runnable locally, useful without a paid API key, and easy to publish on GitHub.",
  channels:
    "GitHub, Hacker News, Product Hunt, Reddit r/LocalLLaMA, X/Twitter demos, developer newsletters",
  pain: 8,
  urgency: 7,
  distribution: 8
};
