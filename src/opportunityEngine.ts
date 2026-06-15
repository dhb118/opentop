import type { AnalysisResult, Opportunity, OpportunityInput } from "./domain";

const productNouns = [
  "Radar",
  "Workbench",
  "Scout",
  "Foundry",
  "Console",
  "Briefing",
  "Studio",
  "Navigator"
];

const wedges = [
  "turns scattered trend notes into ranked product bets",
  "converts a messy launch idea into an issue-by-issue open-source roadmap",
  "compares model, API, and local-first implementation paths before code is written",
  "generates a public README, demo script, and launch checklist from one product brief",
  "scores ideas by pain, urgency, distribution, buildability, and star potential"
];

const differentiators = [
  "local-first demo mode plus optional OpenAI-compatible and Ollama adapters",
  "opinionated GitHub-readiness scoring instead of generic brainstorm output",
  "launch artifacts that are immediately copyable into issues, README sections, and demos",
  "transparent scoring so users can challenge the ranking instead of trusting a black box",
  "designed for builders who need one sharp wedge, not a list of vague startup ideas"
];

const releaseItems = [
  "Signal intake with audience, trend, constraints, and channel context",
  "Opportunity scoring matrix with editable assumptions",
  "README hook and launch-plan generator",
  "Provider switcher for demo, OpenAI-compatible APIs, and Ollama",
  "Exportable Markdown brief for GitHub issues and Product Hunt drafts"
];

export const scoreWeights = {
  pain: 0.24,
  urgency: 0.18,
  distribution: 0.24,
  buildability: 0.16,
  starPotential: 0.18
} as const satisfies Record<keyof Opportunity["scores"], number>;

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function keywords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .filter((word) => !["there", "their", "about", "would", "could", "should"].includes(word))
    )
  ).slice(0, 12);
}

function scoreOpportunity(input: OpportunityInput, index: number): Opportunity["scores"] {
  const buildabilityBase = input.constraints.toLowerCase().includes("local") ? 8 : 6;
  const starPotentialBase = input.channels.toLowerCase().includes("github") ? 8 : 6;

  return {
    pain: clampScore(input.pain + (index % 2) - 1),
    urgency: clampScore(input.urgency + (index % 3) - 1),
    distribution: clampScore(input.distribution + (index % 2)),
    buildability: clampScore(buildabilityBase + (index === 0 ? 1 : 0) - Math.floor(index / 3)),
    starPotential: clampScore(starPotentialBase + (index === 1 ? 1 : 0) - Math.floor(index / 4))
  };
}

function totalScore(scores: Opportunity["scores"]): number {
  return Math.round(Object.entries(scoreWeights).reduce((total, [key, weight]) => total + scores[key as keyof Opportunity["scores"]] * weight, 0));
}

export function analyzeLocally(input: OpportunityInput): AnalysisResult {
  const terms = keywords(`${input.audience} ${input.signal} ${input.constraints}`);
  const anchor = terms[0] ?? "ai";
  const audience = input.audience.trim() || "AI builders";

  const opportunities: Opportunity[] = productNouns.slice(0, 5).map((noun, index) => {
    const name = `${capitalize(anchor)} ${noun}`;
    const scores = scoreOpportunity(input, index);
    const score = totalScore(scores);

    return {
      id: `${anchor}-${noun.toLowerCase()}`,
      name,
      tagline: `${name} helps ${audience} choose a sharper AI product wedge before they start building.`,
      targetUser: audience,
      wedge: wedges[index % wedges.length],
      differentiator: differentiators[index % differentiators.length],
      moat:
        index % 2 === 0
          ? "A growing public library of scored launch briefs compounds into a reusable benchmark."
          : "The workflow connects market signal, implementation scope, and launch assets in one place.",
      score,
      scores,
      firstRelease: rotate(releaseItems, index).slice(0, 3),
      launchPlan: [
        "Ship a polished 90-second screen recording and a no-login hosted demo.",
        "Open 5 starter issues labeled good-first-opportunity so contributors can extend templates.",
        "Publish a transparent build log explaining why this idea scored well.",
        "Post before/after examples that turn vague AI trends into concrete repos."
      ],
      repoHook: `${name}: an AI opportunity radar that turns trend noise into ranked, GitHub-ready app ideas.`,
      risks: [
        "Generic output if the input signal is too broad.",
        "Users may expect business validation beyond a launch-readiness score.",
        "Real model calls need clear privacy expectations for pasted research notes."
      ]
    };
  });

  opportunities.sort((a, b) => b.score - a.score);

  return {
    summary: `Found ${opportunities.length} launchable AI app directions from ${terms.length} extracted signal terms. The top idea balances visible pain, fast distribution loops, and a small TypeScript-first build surface.`,
    opportunities,
    generatedBy: "local-engine"
  };
}

function rotate<T>(items: T[], amount: number): T[] {
  return [...items.slice(amount), ...items.slice(0, amount)];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
