import type { Opportunity } from "./domain.ts";

export type ScoreDimension = keyof Opportunity["scores"];
export type ScoreWeights = Record<ScoreDimension, number>;

export interface ScoringProfile {
  id: string;
  name: string;
  tagline: string;
  bestFor: string;
  weights: ScoreWeights;
}

export const defaultScoringProfileId = "open-source-star-path";

export const scoringProfiles: ScoringProfile[] = [
  {
    id: defaultScoringProfileId,
    name: "Open-source star path",
    tagline: "Balanced pain, distribution, and visible star potential.",
    bestFor: "General GitHub launch bets",
    weights: {
      pain: 0.24,
      urgency: 0.18,
      distribution: 0.24,
      buildability: 0.16,
      starPotential: 0.18
    }
  },
  {
    id: "local-first-tool",
    name: "Local-first tool",
    tagline: "Rewards no-key utility, setup relief, and fast solo adoption.",
    bestFor: "Ollama, desktop, CLI, and privacy-friendly tools",
    weights: {
      pain: 0.28,
      urgency: 0.16,
      distribution: 0.18,
      buildability: 0.26,
      starPotential: 0.12
    }
  },
  {
    id: "provider-sdk",
    name: "Provider SDK",
    tagline: "Prefers composable APIs, integration hooks, and contributor surface.",
    bestFor: "SDKs, adapters, and provider migration helpers",
    weights: {
      pain: 0.18,
      urgency: 0.14,
      distribution: 0.22,
      buildability: 0.28,
      starPotential: 0.18
    }
  },
  {
    id: "agent-debugging",
    name: "Agent debugging",
    tagline: "Prioritizes urgent failure visibility and explainable workflows.",
    bestFor: "Agent traces, permissions, evals, and incident review",
    weights: {
      pain: 0.3,
      urgency: 0.24,
      distribution: 0.14,
      buildability: 0.2,
      starPotential: 0.12
    }
  },
  {
    id: "launch-generator",
    name: "Launch generator",
    tagline: "Optimizes for shareable artifacts and public distribution loops.",
    bestFor: "README, gallery, demo, and social launch tools",
    weights: {
      pain: 0.16,
      urgency: 0.16,
      distribution: 0.3,
      buildability: 0.14,
      starPotential: 0.24
    }
  }
];

export const defaultScoringProfile = getScoringProfile(defaultScoringProfileId);

export function getScoringProfile(id: string): ScoringProfile {
  return scoringProfiles.find((profile) => profile.id === id) ?? scoringProfiles[0];
}

export function weightsSum(weights: ScoreWeights): number {
  return Object.values(weights).reduce((total, weight) => total + weight, 0);
}
