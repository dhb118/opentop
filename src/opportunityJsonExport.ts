import type { Opportunity } from "./domain.ts";
import type { ScoringProfile } from "./scoringProfiles.ts";

export function buildOpportunityJsonExport(
  opportunity: Opportunity,
  scoringProfile: ScoringProfile
): Record<string, unknown> {
  return {
    ...opportunity,
    scoringTemplate: {
      id: scoringProfile.id,
      name: scoringProfile.name,
      bestFor: scoringProfile.bestFor,
      weights: scoringProfile.weights
    }
  };
}
