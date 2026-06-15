import type { AnalysisResult, Opportunity } from "./domain.ts";

type UnknownRecord = Record<string, unknown>;

export function parseModelAnalysis(content: string): AnalysisResult {
  const parsed = parseJsonObject(content);
  const opportunities = Array.isArray(parsed.opportunities)
    ? parsed.opportunities.map(normalizeOpportunity).filter((item): item is Opportunity => Boolean(item))
    : [];

  if (opportunities.length === 0) {
    throw new Error("Model response did not include any valid opportunities.");
  }

  return {
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : "Model generated opportunities.",
    opportunities,
    generatedBy: "model"
  };
}

function parseJsonObject(content: string): UnknownRecord {
  const cleaned = stripCodeFence(content.trim());
  const json = cleaned.startsWith("{") ? cleaned : cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1);

  if (!json.startsWith("{") || !json.endsWith("}")) {
    throw new Error("Model response did not contain a JSON object.");
  }

  const parsed = JSON.parse(json) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Model response JSON was not an object.");
  }
  return parsed;
}

function normalizeOpportunity(value: unknown): Opportunity | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = readText(value.name, "Untitled opportunity");
  const scores = normalizeScores(value.scores);

  return {
    id: readText(value.id, slugify(name)),
    name,
    tagline: readText(value.tagline, `${name} helps builders evaluate an AI product wedge.`),
    targetUser: readText(value.targetUser, "AI builders"),
    wedge: readText(value.wedge, "turns a noisy AI signal into a concrete product wedge"),
    differentiator: readText(value.differentiator, "transparent scoring and launch-ready exports"),
    moat: readText(value.moat, "a growing library of reusable opportunity examples"),
    score: clampScore(value.score),
    scores,
    firstRelease: readTextList(value.firstRelease, ["Ship the smallest useful workflow"]),
    launchPlan: readTextList(value.launchPlan, ["Publish a demo and README"]),
    repoHook: readText(value.repoHook, `${name}: a launch-ready AI app opportunity.`),
    risks: readTextList(value.risks, ["The input signal may be too broad"])
  };
}

function normalizeScores(value: unknown): Opportunity["scores"] {
  const record = isRecord(value) ? value : {};
  return {
    pain: clampScore(record.pain),
    urgency: clampScore(record.urgency),
    distribution: clampScore(record.distribution),
    buildability: clampScore(record.buildability),
    starPotential: clampScore(record.starPotential)
  };
}

function stripCodeFence(value: string): string {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function readText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : fallback;
}

function readTextList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const items = value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim().slice(0, 500))
    .slice(0, 8);
  return items.length > 0 ? items : fallback;
}

function clampScore(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.max(1, Math.min(10, Math.round(numeric))) : 5;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
