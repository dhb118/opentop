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

export function buildXThread(item: Opportunity): string {
  const firstRelease = item.firstRelease.slice(0, 3).map((entry) => `- ${entry}`).join("\n");
  const risks = item.risks.slice(0, 2).map((entry) => `- ${entry}`).join("\n");

  return `1/ I am building ${item.name}: ${item.repoHook}

2/ Target user:
${item.targetUser}

3/ Wedge:
${item.wedge}

4/ Why it is different:
${item.differentiator}

5/ First release:
${firstRelease}

6/ Why it could earn GitHub stars:
Pain ${item.scores.pain}/10, distribution ${item.scores.distribution}/10, star potential ${item.scores.starPotential}/10.

7/ Risks I am watching:
${risks}

8/ The goal: a small TypeScript-first AI app that is useful locally, easy to fork, and clear enough to judge from the README.
`;
}

export function buildRedditPost(item: Opportunity): string {
  return `Title: I am building ${item.name}, a TypeScript-first AI app for ${item.targetUser}

${item.repoHook}

The problem:
${item.wedge}

What makes it different:
${item.differentiator}

First release scope:
${item.firstRelease.map((entry) => `- ${entry}`).join("\n")}

Why I think it has open-source potential:
- Pain: ${item.scores.pain}/10
- Urgency: ${item.scores.urgency}/10
- Distribution: ${item.scores.distribution}/10
- Buildability: ${item.scores.buildability}/10
- Star potential: ${item.scores.starPotential}/10

Risks:
${item.risks.map((entry) => `- ${entry}`).join("\n")}

I would like feedback on the first-release scope and whether the wedge is specific enough for a useful GitHub project.
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

export function buildLaunchKit(item: Opportunity): string {
  return `# ${item.name} Launch Kit

${item.repoHook}

## Positioning

- Target user: ${item.targetUser}
- Wedge: ${item.wedge}
- Differentiator: ${item.differentiator}
- Moat: ${item.moat}
- Score: ${item.score}/10

## Launch Checklist

- [ ] Add a screenshot or short demo clip above the README fold.
- [ ] Publish a no-login local quick start that works in under 60 seconds.
- [ ] Open starter issues from the first-release scope below.
- [ ] Share one concrete before/after example in every launch post.
- [ ] Ask for feedback on the wedge, not on the whole product category.

## README Brief

${buildReadmeBrief(item.name, item).trim()}

## GitHub Issue Body

${buildGitHubIssueBody(item).trim()}

## Show HN Draft

${buildShowHnPost(item).trim()}

## X Thread Draft

${buildXThread(item).trim()}

## Reddit Draft

${buildRedditPost(item).trim()}
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
