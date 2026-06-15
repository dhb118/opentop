import type { Opportunity } from "./domain.ts";

export interface ContributorIssue {
  title: string;
  labels: string[];
  body: string;
}

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

## Contributor Queue

${buildContributorQueueMarkdown(item).trim()}

## Show HN Draft

${buildShowHnPost(item).trim()}

## X Thread Draft

${buildXThread(item).trim()}

## Reddit Draft

${buildRedditPost(item).trim()}
`;
}

export function buildContributorIssueQueue(item: Opportunity): ContributorIssue[] {
  const releaseIssues = item.firstRelease.slice(0, 3).map((entry, index) => ({
    title: `Build first-release slice ${index + 1}: ${entry}`,
    labels: ["good-first-issue", "first-release", "help-wanted"],
    body: buildContributorIssueBody({
      item,
      problem: entry,
      context: item.repoHook,
      acceptance: [
        "The slice is implemented in a small, reviewable change.",
        "README or example output is updated when user-facing behavior changes.",
        "Local tests and production build pass."
      ]
    })
  }));

  const launchIssues: ContributorIssue[] = [
    {
      title: `Add README proof for ${item.name}`,
      labels: ["docs", "growth", "good-first-issue"],
      body: buildContributorIssueBody({
        item,
        problem: "Improve the first-screen GitHub proof so visitors can understand the wedge before reading the full README.",
        context: `Focus on this differentiator: ${item.differentiator}`,
        acceptance: [
          "README includes a current screenshot, GIF, or concrete generated output.",
          "The first screen explains who the project helps and what it produces.",
          "The change avoids private metrics or unsupported star claims."
        ]
      })
    },
    {
      title: `Create launch example for ${item.targetUser}`,
      labels: ["example", "growth", "help-wanted"],
      body: buildContributorIssueBody({
        item,
        problem: "Create one realistic example that shows the workflow end-to-end for the target user.",
        context: `Target user: ${item.targetUser}`,
        acceptance: [
          "Example input and output are committed under docs or examples.",
          "The example maps back to the scored wedge and launch plan.",
          "The README links to the example from the first half of the page."
        ]
      })
    }
  ];

  return [...releaseIssues, ...launchIssues];
}

export function buildContributorQueueMarkdown(item: Opportunity): string {
  const issues = buildContributorIssueQueue(item);

  return `# ${item.name} Contributor Queue

${item.repoHook}

Use these issues to make the repository easier to fork, extend, and star. They are intentionally small enough for first-time contributors.

${issues
  .map(
    (issue, index) => `## ${index + 1}. ${issue.title}

Labels: ${issue.labels.map((label) => `\`${label}\``).join(", ")}

${issue.body.trim()}
`
  )
  .join("\n")}
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

function buildContributorIssueBody({
  item,
  problem,
  context,
  acceptance
}: {
  item: Opportunity;
  problem: string;
  context: string;
  acceptance: string[];
}): string {
  return `## Background

${context}

## Task

${problem}

## Acceptance

${acceptance.map((entry) => `- [ ] ${entry}`).join("\n")}

## Source Opportunity

- Name: ${item.name}
- Score: ${item.score}/10
- Wedge: ${item.wedge}
- Star potential: ${item.scores.starPotential}/10
`;
}
