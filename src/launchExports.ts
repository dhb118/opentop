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

export function buildRepoScaffoldPlan(item: Opportunity): string {
  return `# ${item.name} Repository Scaffold

${item.repoHook}

## File Tree

\`\`\`text
${slugify(item.name)}/
  README.md
  LICENSE
  package.json
  src/
    index.ts
    app.ts
    scoring.ts
  docs/
    launch-plan.md
    examples.md
  tests/
    scoring.test.ts
  .github/
    workflows/ci.yml
    ISSUE_TEMPLATE/feature_request.yml
\`\`\`

## README Structure

- Product hook: ${item.repoHook}
- Target user: ${item.targetUser}
- Differentiator: ${item.differentiator}
- Install and quick-start path
- One screenshot or SVG share card
- First successful workflow in under 60 seconds

## First Release Scope

${item.firstRelease.map((entry) => `- [ ] ${entry}`).join("\n")}

## Starter Issues

${item.launchPlan.map((entry) => `- [ ] ${entry}`).join("\n")}

## Risks To Document

${item.risks.map((entry) => `- ${entry}`).join("\n")}
`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
