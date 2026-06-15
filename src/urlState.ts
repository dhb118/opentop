import { defaultInput, type OpportunityInput } from "./domain.ts";

export function encodeBrief(input: OpportunityInput): string {
  const bytes = new TextEncoder().encode(JSON.stringify(input));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeBrief(value: string | null): OpportunityInput | null {
  if (!value) {
    return null;
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<OpportunityInput>;
    return normalizeInput(parsed);
  } catch {
    return null;
  }
}

export function readBriefFromSearch(search: string): OpportunityInput | null {
  return decodeBrief(new URLSearchParams(search).get("brief"));
}

export function createShareUrl(input: OpportunityInput, currentUrl: string): string {
  const url = new URL(currentUrl);
  url.searchParams.set("brief", encodeBrief(input));
  url.hash = "";
  return url.toString();
}

function normalizeInput(input: Partial<OpportunityInput>): OpportunityInput {
  return {
    audience: cleanText(input.audience, defaultInput.audience),
    signal: cleanText(input.signal, defaultInput.signal),
    constraints: cleanText(input.constraints, defaultInput.constraints),
    channels: cleanText(input.channels, defaultInput.channels),
    pain: cleanScore(input.pain, defaultInput.pain),
    urgency: cleanScore(input.urgency, defaultInput.urgency),
    distribution: cleanScore(input.distribution, defaultInput.distribution)
  };
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.slice(0, 2000) : fallback;
}

function cleanScore(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.max(1, Math.min(10, Math.round(numeric))) : fallback;
}
