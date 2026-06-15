import { defaultInput, defaultSettings, type OpportunityInput, type ProviderSettings } from "./domain";

const inputKey = "opentop.input.v1";
const settingsKey = "opentop.settings.v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadInput(): OpportunityInput {
  return readJson(inputKey, defaultInput);
}

export function saveInput(input: OpportunityInput): void {
  localStorage.setItem(inputKey, JSON.stringify(input));
}

export function loadSettings(): ProviderSettings {
  return readJson(settingsKey, defaultSettings);
}

export function saveSettings(settings: ProviderSettings): void {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}
