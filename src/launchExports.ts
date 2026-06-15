import type { Opportunity } from "./domain.ts";

export interface ContributorIssue {
  title: string;
  labels: string[];
  body: string;
}

export interface StarGrowthStage {
  milestone: string;
  objective: string;
  actions: string[];
  proof: string[];
  risks: string[];
}

export interface RepoListingPack {
  description: string;
  topics: string[];
  homepageRecommendation: string;
  socialPreviewAlt: string;
  pinnedIssueTitle: string;
  pinnedIssueBody: string;
  ghCommands: string[];
  checklist: string[];
}

export interface PublicLaunchBrief {
  headline: string;
  oneLiner: string;
  demoStory: string[];
  proofChecklist: string[];
  channelSequence: string[];
  followUpLoop: string[];
  feedbackAsk: string;
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

export function buildProductHuntLaunchDraft(item: Opportunity): string {
  const firstRelease = item.firstRelease.slice(0, 3).map((entry) => `- ${entry}`).join("\n");

  return `# Product Hunt Launch Draft: ${item.name}

## Tagline

${trimForGitHubDescription(item.repoHook)}

## Short Description

${item.name} helps ${item.targetUser} turn an AI workflow signal into a scoped, launch-ready open-source project plan.

## Maker Comment

I built ${item.name} because ${item.targetUser} often see AI trends, issues, and tool ideas before they know which project is worth shipping.

The demo focuses on one loop: paste a signal, compare opportunities by pain, urgency, distribution, buildability, and star potential, then copy launch artifacts for GitHub.

First release proof:
${firstRelease}

I would like feedback on whether the wedge is specific enough and which export would make this more useful before a public GitHub launch.

## Gallery Notes

- Show the score matrix first.
- Show one generated README or launch brief.
- Show the share card or opportunity gallery so visitors can judge output quality quickly.
`;
}

export function buildNewsletterPitch(item: Opportunity): string {
  const primaryChannel = pickFirstChannel(item.launchPlan);
  const firstSlice = item.firstRelease[0] ?? "Ship one narrow workflow that proves the wedge.";

  return `Subject: ${item.name} - ${item.repoHook}

Hi,

I am launching ${item.name}, a TypeScript-first open-source AI tool for ${item.targetUser}.

The problem: ${item.wedge}

The useful loop:

1. Paste a trend signal, GitHub issue, link list, or product hunch.
2. Compare generated opportunities by pain, urgency, distribution, buildability, and star potential.
3. Copy a README brief, launch brief, repo listing pack, contributor queue, or starter repo plan.

Why it may be useful for your readers:

- It runs locally without requiring an API key.
- It makes the tradeoffs behind an AI project idea visible before code is written.
- It produces GitHub-ready launch and contribution artifacts instead of only brainstorming text.

First release slice: ${firstSlice}

Best channel fit: ${primaryChannel}

I would be grateful for feedback on whether the scoring dimensions match how builders actually decide which AI projects to ship.
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

## GitHub Repo Listing Pack

${buildRepoListingPackMarkdown(item).trim()}

## Launch Checklist

- [ ] Add a screenshot or short demo clip above the README fold.
- [ ] Publish a no-login local quick start that works in under 60 seconds.
- [ ] Copy the public launch brief and make every post point to one concrete proof item.
- [ ] Open starter issues from the first-release scope below.
- [ ] Share one concrete before/after example in every launch post.
- [ ] Ask for feedback on the wedge, not on the whole product category.

## Public Launch Brief

${buildPublicLaunchBriefMarkdown(item).trim()}

## README Brief

${buildReadmeBrief(item.name, item).trim()}

## GitHub Issue Body

${buildGitHubIssueBody(item).trim()}

## Contributor Queue

${buildContributorQueueMarkdown(item).trim()}

## Star Growth Plan

${buildStarGrowthPlanMarkdown(item).trim()}

## Show HN Draft

${buildShowHnPost(item).trim()}

## X Thread Draft

${buildXThread(item).trim()}

## Reddit Draft

${buildRedditPost(item).trim()}

## Product Hunt Draft

${buildProductHuntLaunchDraft(item).trim()}

## Newsletter Pitch

${buildNewsletterPitch(item).trim()}
`;
}

export function buildPublicLaunchBrief(item: Opportunity): PublicLaunchBrief {
  const firstSlice = item.firstRelease[0] ?? "Ship one narrow workflow that proves the wedge.";
  const secondSlice = item.firstRelease[1] ?? "Add one example that makes the output easy to judge.";
  const primaryChannel = pickFirstChannel(item.launchPlan);

  return {
    headline: trimForGitHubDescription(`${item.name}: ${item.repoHook}`),
    oneLiner: `${item.name} helps ${item.targetUser} ${item.wedge.toLowerCase()}.`,
    demoStory: [
      `Before: ${item.targetUser} has a signal but no clear first-release wedge.`,
      `Action: run ${item.name} and compare ideas by pain, urgency, distribution, buildability, and star potential.`,
      `After: publish a scoped repository plan with this first slice: ${firstSlice}`
    ],
    proofChecklist: [
      "README first screen names the user, outcome, local quick start, and current demo path.",
      "Screenshot, share card, or generated output is visible before broad launch.",
      `Starter issue exists for the next slice: ${secondSlice}`,
      "Launch posts link to GitHub, the hosted or fallback demo, and one concrete example."
    ],
    channelSequence: [
      `Primary channel: ${primaryChannel}`,
      "GitHub: pin the first-release map and label good-first-issue work before posting.",
      "Hacker News or Reddit: lead with the before/after demo story, not a generic AI app claim.",
      "X/Twitter or newsletter: show one generated artifact and invite feedback on the wedge."
    ],
    followUpLoop: [
      "First 24 hours: answer setup questions and convert repeated confusion into README edits.",
      "First 72 hours: open issues for every useful request and close unclear or broad suggestions with scope notes.",
      "First week: ship one example, one doc improvement, and one contributor-friendly issue from launch feedback."
    ],
    feedbackAsk: `What would make ${item.name} more useful for ${item.targetUser}: sharper scoring, clearer examples, or a smaller first-release scope?`
  };
}

export function buildPublicLaunchBriefMarkdown(item: Opportunity): string {
  const brief = buildPublicLaunchBrief(item);

  return `# ${item.name} Public Launch Brief

${brief.headline}

## One-Liner

${brief.oneLiner}

## Demo Story

${brief.demoStory.map((entry) => `- ${entry}`).join("\n")}

## Proof Checklist

${brief.proofChecklist.map((entry) => `- [ ] ${entry}`).join("\n")}

## Channel Sequence

${brief.channelSequence.map((entry) => `- ${entry}`).join("\n")}

## Follow-Up Loop

${brief.followUpLoop.map((entry) => `- [ ] ${entry}`).join("\n")}

## Feedback Ask

${brief.feedbackAsk}
`;
}

export function buildRepoListingPack(item: Opportunity): RepoListingPack {
  const description = trimForGitHubDescription(`${item.name}: ${item.repoHook}`);
  const topics = buildTopics(item);
  const homepageRecommendation =
    "Use the hosted demo URL once it works; until then keep the README Quick Start as the visible fallback.";
  const socialPreviewAlt = trimForGitHubDescription(
    `${item.name} interface showing ${item.targetUser} turning an AI workflow signal into a launch-ready repository plan.`
  );
  const pinnedIssueTitle = `Start here: ${item.name} first release map`;
  const pinnedIssueBody = `## Why this repository exists

${item.repoHook}

## First release

${item.firstRelease.map((entry) => `- [ ] ${entry}`).join("\n")}

## Good first contribution paths

- Improve README proof for the target user: ${item.targetUser}
- Add one example that demonstrates the wedge: ${item.wedge}
- Open or refine starter issues for docs, examples, provider support, and launch assets.

## Score context

- Overall: ${item.score}/10
- Distribution: ${item.scores.distribution}/10
- Star potential: ${item.scores.starPotential}/10
`;
  const ghCommands = [
    `gh repo edit OWNER/REPO --description ${quoteForShell(description)}`,
    "gh repo edit OWNER/REPO --homepage https://YOUR-DEMO-URL.example.com",
    "gh repo edit OWNER/REPO --enable-issues",
    `gh repo edit OWNER/REPO ${topics.map((topic) => `--add-topic ${topic}`).join(" ")}`
  ];
  const checklist = [
    "Description names the outcome, not just the category.",
    "Topics include TypeScript, AI, open-source, and the strongest user workflow.",
    "Homepage points to a working hosted demo before broad launch.",
    "Social preview image or screenshot matches the README first screen.",
    "Pinned issue gives first-time contributors a clear starting point."
  ];

  return {
    description,
    topics,
    homepageRecommendation,
    socialPreviewAlt,
    pinnedIssueTitle,
    pinnedIssueBody,
    ghCommands,
    checklist
  };
}

export function buildRepoListingPackMarkdown(item: Opportunity): string {
  const pack = buildRepoListingPack(item);

  return `# ${item.name} GitHub Repo Listing Pack

Use this before a public launch so GitHub visitors can understand, search for, and contribute to the repository from the first screen.

## About Description

${pack.description}

## Topics

${pack.topics.map((topic) => `\`${topic}\``).join(", ")}

## Homepage

${pack.homepageRecommendation}

## Social Preview Alt Text

${pack.socialPreviewAlt}

## Pinned Issue

Title: ${pack.pinnedIssueTitle}

${pack.pinnedIssueBody.trim()}

## GitHub CLI Setup

\`\`\`bash
${pack.ghCommands.join("\n")}
\`\`\`

## Listing Checklist

${pack.checklist.map((entry) => `- [ ] ${entry}`).join("\n")}
`;
}

export function buildStarGrowthStages(item: Opportunity): StarGrowthStage[] {
  const primaryChannel = pickFirstChannel(item.launchPlan);
  const releaseSlice = item.firstRelease[0] ?? "Ship one narrow workflow that proves the wedge.";
  const secondSlice = item.firstRelease[1] ?? "Add one example that makes the workflow easy to judge.";
  const thirdSlice = item.firstRelease[2] ?? "Add contributor documentation and starter issues.";
  const mainRisk = item.risks[0] ?? "The wedge may be too broad for visitors to understand quickly.";
  const distributionRisk =
    item.scores.distribution >= 8
      ? "Strong distribution can still fail if the demo and README do not prove the outcome in the first minute."
      : "Distribution score is not yet high enough; treat channel testing as required product work.";
  const starRisk =
    item.scores.starPotential >= 8
      ? "High star potential depends on clear proof, not on generic launch copy."
      : "Star potential needs stronger public proof before a large launch push.";

  return [
    {
      milestone: "1 star",
      objective: "Make the repository understandable enough for one trusted builder to star after a cold visit.",
      actions: [
        `Tighten the first README screen around this hook: ${item.repoHook}`,
        `Ship the smallest first-release slice: ${releaseSlice}`,
        "Add a no-signup quick start and one screenshot or generated output above the fold."
      ],
      proof: [
        "A new visitor can explain the target user and outcome without reading the full README.",
        "Local install, test, and build commands are visible and current.",
        "At least one trusted target user has reviewed the repository link."
      ],
      risks: [mainRisk, "Do not ask broad audiences for stars before the first-screen proof is clear."]
    },
    {
      milestone: "10 stars",
      objective: "Turn early feedback into a repeatable public demo and contributor surface.",
      actions: [
        `Publish one before/after example for ${item.targetUser}`,
        `Open starter issues from the contributor queue, starting with: ${secondSlice}`,
        "Share the repository with a small trusted audience and ask for README clarity feedback."
      ],
      proof: [
        "README links to one concrete example or gallery item.",
        "Issues are enabled with good-first-issue labels and scoped acceptance criteria.",
        "Feedback creates at least one README, example, or first-release improvement."
      ],
      risks: [distributionRisk, "Avoid optimizing for comments if the repository is still hard to run."]
    },
    {
      milestone: "100 stars",
      objective: "Convert the strongest launch channel into a durable acquisition loop.",
      actions: [
        `Turn this launch channel into a repeatable post: ${primaryChannel}`,
        `Ship the next first-release slice: ${thirdSlice}`,
        "Add a short demo video, social preview card, and copied launch posts that point back to GitHub."
      ],
      proof: [
        "Every public post links to the repository, demo status, and one concrete example.",
        "The repo profile has topics, license, homepage, starter issues, and current badges.",
        "Questions from visitors are converted into docs, examples, or labeled issues."
      ],
      risks: [starRisk, "A channel spike without a contributor path usually decays after launch day."]
    },
    {
      milestone: "1,000 stars",
      objective: "Make the project forkable, extensible, and visibly maintained.",
      actions: [
        "Add templates, provider adapters, examples, or plugin points that let others reuse the core workflow.",
        "Publish a weekly changelog or build note that shows active maintenance and real user problems.",
        "Invite contributors to own docs, examples, provider integrations, and launch benchmark improvements."
      ],
      proof: [
        "The repository has multiple paths for contribution beyond core code changes.",
        "Examples cover at least three realistic use cases or launch channels.",
        "Maintainer responses convert repeated support questions into durable documentation."
      ],
      risks: [
        "A larger audience will amplify unclear setup, stale demos, and unsupported provider claims.",
        "Keep scope tight; a broad AI platform pitch is harder to star than a sharp tool."
      ]
    },
    {
      milestone: "10,000 stars",
      objective: "Become the reference open-source workflow for this specific AI builder problem.",
      actions: [
        `Name the category around the wedge: ${item.wedge}`,
        "Publish comparison docs, migration examples, templates, and a public roadmap that make the project easy to cite.",
        "Create a maintainer loop for triage, releases, docs freshness, security fixes, and community examples."
      ],
      proof: [
        "External posts can describe the project in one sentence without copying the README.",
        "The project has recurring examples, releases, and contributor activity that do not depend on one launch event.",
        "The repository is safe to recommend: current demo status, license, setup, and contribution paths are visible."
      ],
      risks: [
        "10k stars require distribution outside the maintainer's network; invest in repeatable proof and references.",
        "Do not chase broad feature requests that weaken the original wedge."
      ]
    }
  ];
}

export function buildStarGrowthPlanMarkdown(item: Opportunity): string {
  const stages = buildStarGrowthStages(item);

  return `# ${item.name} Star Growth Plan

${item.repoHook}

This plan translates the opportunity score into staged GitHub growth work. It is a roadmap for earning trust, contribution, and distribution; it is not a guarantee of stars.

## Score Context

- Overall: ${item.score}/10
- Pain: ${item.scores.pain}/10
- Urgency: ${item.scores.urgency}/10
- Distribution: ${item.scores.distribution}/10
- Buildability: ${item.scores.buildability}/10
- Star potential: ${item.scores.starPotential}/10

${stages
  .map(
    (stage) => `## ${stage.milestone}

Objective: ${stage.objective}

Actions:
${stage.actions.map((entry) => `- [ ] ${entry}`).join("\n")}

Proof:
${stage.proof.map((entry) => `- ${entry}`).join("\n")}

Risks:
${stage.risks.map((entry) => `- ${entry}`).join("\n")}
`
  )
  .join("\n")}
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

function pickFirstChannel(launchPlan: string[]): string {
  return (
    launchPlan.find((entry) => /\b(Hacker News|Product Hunt|Reddit|GitHub|newsletter|X|Twitter)\b/i.test(entry)) ??
    launchPlan[0] ??
    "Share the strongest concrete demo with a developer audience."
  );
}

function trimForGitHubDescription(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) {
    return normalized;
  }
  return `${normalized.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

function buildTopics(item: Opportunity): string[] {
  const keywords = `${item.name} ${item.tagline} ${item.wedge} ${item.targetUser}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !topicStopWords.has(word));
  const candidates = [
    "ai",
    "typescript",
    "open-source",
    "developer-tools",
    item.repoHook.match(/\b(local|without an api key|no api key|no signup)\b/i) ? "local-first" : "ai-tools",
    item.scores.distribution >= 8 ? "launch-tools" : "startup-ideas",
    item.scores.starPotential >= 8 ? "open-source-growth" : "repo-scaffold",
    ...keywords
  ];

  return uniqueTopics(candidates).slice(0, 8);
}

const topicStopWords = new Set([
  "with",
  "without",
  "from",
  "that",
  "this",
  "into",
  "your",
  "their",
  "builder",
  "builders",
  "developer",
  "developers",
  "workflow",
  "workflows"
]);

function uniqueTopics(values: string[]): string[] {
  const topics: string[] = [];
  for (const value of values) {
    const topic = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
    if (!topic || topics.includes(topic)) {
      continue;
    }
    topics.push(topic);
  }
  return topics;
}

function quoteForShell(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
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
