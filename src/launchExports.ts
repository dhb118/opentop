import type { Opportunity } from "./domain.ts";

export function buildReadmeBrief(title: string, item: Opportunity): string {
  return `# ${title}

${item.repoHook}

## Why this can work

- Target user: ${item.targetUser}
- Wedge: ${item.wedge}
- Differentiator: ${item.differentiator}
- Moat: ${item.moat}

## First release

${item.firstRelease.map((entry) => `- ${entry}`).join("\n")}

## Launch plan

${item.launchPlan.map((entry) => `- ${entry}`).join("\n")}
`;
}

export function buildShowHnPost(item: Opportunity): string {
  return `Show HN: ${item.name} - ${item.repoHook}

I built ${item.name} for ${item.targetUser}.

The wedge: ${item.wedge}

Why it is different: ${item.differentiator}

First release scope:
${item.firstRelease.map((entry) => `- ${entry}`).join("\n")}

Launch plan:
${item.launchPlan.map((entry) => `- ${entry}`).join("\n")}
`;
}

export function buildGitHubIssueBody(item: Opportunity): string {
  return `## Problem

${item.repoHook}

## Target user

${item.targetUser}

## Wedge

${item.wedge}

## Why this is different

${item.differentiator}

## First release scope

${item.firstRelease.map((entry) => `- [ ] ${entry}`).join("\n")}

## Score

- Overall: ${item.score}/10
- Pain: ${item.scores.pain}/10
- Urgency: ${item.scores.urgency}/10
- Distribution: ${item.scores.distribution}/10
- Buildability: ${item.scores.buildability}/10
- Star potential: ${item.scores.starPotential}/10

## Risks

${item.risks.map((entry) => `- ${entry}`).join("\n")}
`;
}
