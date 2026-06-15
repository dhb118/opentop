import { defaultInput, defaultSettings, type OpportunityInput, type ProviderSettings } from "./domain";
import { defaultLocale, normalizeLocale, type AppLocale } from "./localization";
import { defaultScoringProfileId, getScoringProfile } from "./scoringProfiles";

const inputKey = "opentop.input.v1";
const localeKey = "opentop.locale.v1";
const settingsKey = "opentop.settings.v1";
const scoringProfileKey = "opentop.scoringProfile.v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadInput(fallback: OpportunityInput = defaultInput): OpportunityInput {
  return readJson(inputKey, fallback);
}

export function saveInput(input: OpportunityInput): void {
  localStorage.setItem(inputKey, JSON.stringify(input));
}

export function loadLocale(fallback: AppLocale = defaultLocale): AppLocale {
  try {
    return normalizeLocale(JSON.parse(localStorage.getItem(localeKey) ?? JSON.stringify(fallback)));
  } catch {
    return fallback;
  }
}

export function saveLocale(locale: AppLocale): void {
  localStorage.setItem(localeKey, JSON.stringify(normalizeLocale(locale)));
}

export function loadSettings(): ProviderSettings {
  return readJson(settingsKey, defaultSettings);
}

export function saveSettings(settings: ProviderSettings): void {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export function loadScoringProfileId(): string {
  try {
    const raw = localStorage.getItem(scoringProfileKey);
    return raw ? getScoringProfile(JSON.parse(raw)).id : defaultScoringProfileId;
  } catch {
    return defaultScoringProfileId;
  }
}

export function saveScoringProfileId(profileId: string): void {
  localStorage.setItem(scoringProfileKey, JSON.stringify(getScoringProfile(profileId).id));
}
