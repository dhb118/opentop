import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { buildModelRequest, defaultEndpointForProvider, defaultModelForProvider } from "../src/aiClient.ts";
import { buildBenchmarkComparisons } from "../src/benchmarkComparison.ts";
import { defaultInput } from "../src/domain.ts";
import {
  buildContributorIssueQueue,
  buildContributorQueueMarkdown,
  buildGitHubIssueBody,
  buildLaunchKit,
  buildReadmeBrief,
  buildRedditPost,
  buildRepoScaffoldPlan,
  buildShowHnPost,
  buildXThread
} from "../src/launchExports.ts";
import { parseModelAnalysis } from "../src/modelResponse.ts";
import { analyzeLocally, scoreWeights, totalScore } from "../src/opportunityEngine.ts";
import { buildOpportunityJsonExport } from "../src/opportunityJsonExport.ts";
import {
  auditReadmeForStars,
  buildGitHubRepoStarProfile,
  fetchGitHubRepoProfile,
  fetchGitHubReadme,
  formatGitHubRepoStarProfile,
  formatReadmeStarAudit,
  parseGitHubRepoUrl
} from "../src/readmeAudit.ts";
import {
  buildRepoScaffoldFiles,
  buildRepoScaffoldZipBytes,
  repoScaffoldRootName
} from "../src/repoScaffold.ts";
import { defaultScoringProfileId, getScoringProfile, scoringProfiles, weightsSum } from "../src/scoringProfiles.ts";
import { buildShareCardSvg, buildShareCardSvgDataUrl, shareCardDimensions } from "../src/shareCard.ts";
import { isOpportunityNavigationKey, nextOpportunityIndex } from "../src/keyboardNavigation.ts";
import {
  fetchGitHubIssueSignals,
  parseGitHubIssueUrls,
  parseTrendCsv,
  parseTrendLinks,
  parseTrendNotes,
  parseTrendSignals
} from "../src/trendImport.ts";
import { createShareUrl, decodeBrief, encodeBrief, readBriefFromSearch } from "../src/urlState.ts";
import { benchmarkRepos } from "../src/benchmarkRepos.ts";
import { sampleBriefs } from "../src/sampleBriefs.ts";
import { buildBenchmarksJson, buildBenchmarksMarkdown } from "../scripts/generate-benchmarks.mjs";
import { buildGalleryJson, buildGalleryMarkdown } from "../scripts/generate-gallery.mjs";
import { extractAssetUrls, resolveSmokeOptions } from "../scripts/smoke-pages.mjs";
import { parseLabelsYaml } from "../scripts/sync-labels.mjs";

describe("analyzeLocally", () => {
  it("returns ranked launchable opportunities", () => {
    const result = analyzeLocally(defaultInput);

    assert.equal(result.generatedBy, "local-engine");
    assert.equal(result.opportunities.length, 5);

    const scores = result.opportunities.map((item) => item.score);
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
  });

  it("keeps every score inside the public 1-10 scale", () => {
    const result = analyzeLocally({
      ...defaultInput,
      pain: 10,
      urgency: 1,
      distribution: 10
    });

    for (const opportunity of result.opportunities) {
      assert.ok(opportunity.score >= 1 && opportunity.score <= 10);
      for (const value of Object.values(opportunity.scores)) {
        assert.ok(value >= 1 && value <= 10);
      }
    }
  });

  it("uses normalized public weights for the total opportunity score", () => {
    const totalWeight = Object.values(scoreWeights).reduce((total, weight) => total + weight, 0);
    assert.equal(totalWeight, 1);

    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const expected = Math.round(
      Object.entries(scoreWeights).reduce((total, [key, weight]) => total + opportunity.scores[key] * weight, 0)
    );

    assert.equal(opportunity.score, expected);
  });

  it("produces export-ready launch artifacts for each opportunity", () => {
    const result = analyzeLocally(defaultInput);

    for (const opportunity of result.opportunities) {
      assert.match(opportunity.repoHook, /AI|ai/);
      assert.ok(opportunity.firstRelease.length >= 3);
      assert.ok(opportunity.launchPlan.length >= 4);
      assert.ok(opportunity.risks.length >= 3);
    }
  });
});

describe("scoring templates", () => {
  it("keeps the default scoring template compatible with public score weights", () => {
    const defaultProfile = getScoringProfile(defaultScoringProfileId);

    assert.deepEqual(defaultProfile.weights, scoreWeights);
    assert.equal(weightsSum(defaultProfile.weights), 1);
    assert.equal(scoringProfiles.some((profile) => profile.id === defaultScoringProfileId), true);
  });

  it("keeps every scoring template normalized and visible", () => {
    for (const profile of scoringProfiles) {
      assert.equal(weightsSum(profile.weights), 1);
      assert.ok(profile.name.length > 0);
      assert.ok(profile.bestFor.length > 0);
    }
  });

  it("lets templates change total scores without changing raw dimensions", () => {
    const defaultProfile = getScoringProfile(defaultScoringProfileId);
    const launchProfile = getScoringProfile("launch-generator");
    const scores = {
      pain: 5,
      urgency: 5,
      distribution: 10,
      buildability: 4,
      starPotential: 10
    };

    assert.notEqual(totalScore(scores, defaultProfile.weights), totalScore(scores, launchProfile.weights));
    const launchOpportunity = analyzeLocally(defaultInput, launchProfile.weights).opportunities[0];
    assert.equal(launchOpportunity.score, totalScore(launchOpportunity.scores, launchProfile.weights));
  });
});

describe("brief URL state", () => {
  it("round-trips an opportunity brief through the URL-safe payload", () => {
    const encoded = encodeBrief(defaultInput);
    assert.deepEqual(decodeBrief(encoded), defaultInput);
  });

  it("creates share links that can be loaded back into the app", () => {
    const shareUrl = createShareUrl(defaultInput, "https://example.com/opentop/?x=1#old");
    const parsed = new URL(shareUrl);

    assert.equal(parsed.hash, "");
    assert.deepEqual(readBriefFromSearch(parsed.search), defaultInput);
  });

  it("normalizes untrusted brief URL values", () => {
    const decoded = decodeBrief(
      encodeBrief({
        audience: "",
        signal: "short signal",
        constraints: "constraints",
        channels: "channels",
        pain: 99,
        urgency: "2",
        distribution: "not-a-number"
      })
    );

    assert.equal(decoded?.audience, defaultInput.audience);
    assert.equal(decoded?.signal, "short signal");
    assert.equal(decoded?.pain, 10);
    assert.equal(decoded?.urgency, 2);
    assert.equal(decoded?.distribution, defaultInput.distribution);
  });
});

describe("model provider requests", () => {
  it("builds an Anthropic Messages API request without placing secrets in the body", () => {
    const request = buildModelRequest(defaultInput, {
      provider: "anthropic",
      endpoint: "",
      apiKey: "sk-ant-test",
      model: ""
    });
    const body = JSON.parse(request.body);

    assert.equal(request.endpoint, "https://api.anthropic.com/v1/messages");
    assert.equal(request.headers["x-api-key"], "sk-ant-test");
    assert.equal(request.headers["anthropic-version"], "2023-06-01");
    assert.equal(body.model, "claude-sonnet-4-5");
    assert.equal(body.max_tokens, 2600);
    assert.equal(body.messages[0].role, "user");
    assert.equal(typeof body.system, "string");
    assert.doesNotMatch(request.body, /sk-ant-test/);
    assert.equal(body.temperature, undefined);
    assert.equal(body.response_format, undefined);
  });

  it("builds an Anthropic Bedrock request with cloud defaults and header-only bearer token", () => {
    const request = buildModelRequest(defaultInput, {
      provider: "anthropic-bedrock",
      endpoint: "",
      apiKey: "bedrock-token",
      model: ""
    });
    const body = JSON.parse(request.body);

    assert.equal(defaultEndpointForProvider("anthropic-bedrock"), "https://bedrock-mantle.us-east-1.api.aws/anthropic/v1/messages");
    assert.equal(defaultModelForProvider("anthropic-bedrock"), "anthropic.claude-haiku-4-5");
    assert.equal(request.endpoint, "https://bedrock-mantle.us-east-1.api.aws/anthropic/v1/messages");
    assert.equal(request.headers["x-api-key"], "bedrock-token");
    assert.equal(request.headers["anthropic-version"], "2023-06-01");
    assert.equal(body.model, "anthropic.claude-haiku-4-5");
    assert.doesNotMatch(request.body, /bedrock-token/);
  });

  it("builds a Vertex AI Anthropic rawPredict request with model endpoint replacement", () => {
    const request = buildModelRequest(defaultInput, {
      provider: "anthropic-vertex",
      endpoint:
        "https://us-central1-aiplatform.googleapis.com/v1/projects/opentop/locations/us-central1/publishers/anthropic/models/MODEL:rawPredict",
      apiKey: "ya29.vertex-token",
      model: "claude-haiku-4-5@20251001"
    });
    const body = JSON.parse(request.body);

    assert.equal(defaultModelForProvider("anthropic-vertex"), "claude-haiku-4-5@20251001");
    assert.equal(
      request.endpoint,
      "https://us-central1-aiplatform.googleapis.com/v1/projects/opentop/locations/us-central1/publishers/anthropic/models/claude-haiku-4-5@20251001:rawPredict"
    );
    assert.equal(request.headers.Authorization, "Bearer ya29.vertex-token");
    assert.equal(body.anthropic_version, "vertex-2023-10-16");
    assert.equal(body.model, undefined);
    assert.doesNotMatch(request.body, /ya29\.vertex-token/);
  });

  it("keeps OpenAI-compatible requests on chat completions defaults", () => {
    const request = buildModelRequest(defaultInput, {
      provider: "openai-compatible",
      endpoint: "",
      apiKey: "sk-test",
      model: ""
    });
    const body = JSON.parse(request.body);

    assert.equal(defaultEndpointForProvider("openai-compatible"), "https://api.openai.com/v1/chat/completions");
    assert.equal(defaultModelForProvider("openai-compatible"), "gpt-4.1-mini");
    assert.equal(request.headers.Authorization, "Bearer sk-test");
    assert.equal(body.response_format.type, "json_object");
    assert.equal(body.messages[0].role, "system");
  });
});

describe("generated opportunity gallery", () => {
  it("includes enough concrete sample briefs for a public launch", () => {
    assert.ok(sampleBriefs.length >= 9);

    for (const brief of sampleBriefs) {
      assert.match(brief.id, /^[a-z0-9-]+$/);
      assert.ok(brief.title.length >= 8);
      assert.ok(brief.input.audience.length >= 30);
      assert.ok(brief.input.signal.length >= 90);
      assert.ok(brief.input.constraints.length >= 30);
      assert.ok(brief.input.channels.includes("GitHub"));
      assert.ok(brief.input.pain >= 1 && brief.input.pain <= 10);
      assert.ok(brief.input.urgency >= 1 && brief.input.urgency <= 10);
      assert.ok(brief.input.distribution >= 1 && brief.input.distribution <= 10);
    }
  });

  it("keeps committed gallery files synchronized with sample briefs", async () => {
    const [markdown, json] = await Promise.all([
      readFile("docs/GALLERY.md", "utf8"),
      readFile("public/gallery.json", "utf8")
    ]);

    assert.equal(markdown, buildGalleryMarkdown());
    assert.equal(json, buildGalleryJson());
  });
});

describe("generated benchmark examples", () => {
  it("keeps committed benchmark files synchronized with structured examples", async () => {
    const [markdown, json] = await Promise.all([
      readFile("docs/BENCHMARKS.md", "utf8"),
      readFile("public/benchmarks.json", "utf8")
    ]);

    assert.equal(markdown, buildBenchmarksMarkdown());
    assert.equal(json, buildBenchmarksJson());
  });

  it("maps every benchmark to an OpenTop score dimension without private metrics", () => {
    const dimensions = new Set(["pain", "urgency", "distribution", "buildability", "starPotential"]);

    for (const benchmark of benchmarkRepos) {
      assert.ok(dimensions.has(benchmark.dimension));
      assert.match(benchmark.url, /^https:\/\/github\.com\//);
      assert.match(benchmark.sourceUrl, /^https:\/\/github\.com\//);
      assert.doesNotMatch(`${benchmark.publicSignal} ${benchmark.lesson}`, /\b\d[\d,.]*\s+stars?\b/i);
      assert.doesNotMatch(`${benchmark.publicSignal} ${benchmark.lesson}`, /\b\d[\d,.]*\s+(ARR|revenue|valuation)\b/i);
    }
  });

  it("builds in-app benchmark comparisons from public benchmark JSON", async () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const publicBenchmarks = JSON.parse(await readFile("public/benchmarks.json", "utf8"));
    const comparisons = buildBenchmarkComparisons(opportunity, publicBenchmarks);

    assert.equal(comparisons.length, benchmarkRepos.length);
    for (const comparison of comparisons) {
      assert.equal(comparison.score, opportunity.scores[comparison.dimension]);
      assert.match(comparison.url, /^https:\/\/github\.com\//);
      assert.match(comparison.sourceUrl, /^https:\/\/github\.com\//);
      assert.ok(["strong", "watch", "gap"].includes(comparison.alignment));
      assert.doesNotMatch(`${comparison.signal} ${comparison.lesson} ${comparison.use}`, /\b\d[\d,.]*\s+stars?\b/i);
    }
  });
});

describe("share card export", () => {
  it("builds a portable SVG card for an opportunity", () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const svg = buildShareCardSvg(opportunity);

    assert.equal(shareCardDimensions.width, 1200);
    assert.equal(shareCardDimensions.height, 630);
    assert.match(svg, /^<svg width="1200" height="630"/);
    assert.match(svg, /OPENTOP OPPORTUNITY/);
    assert.match(svg, new RegExp(opportunity.name));
    assert.match(svg, /image\/svg\+xml|<\/svg>/);
  });

  it("builds a browser-safe SVG data URL for PNG rendering", () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const dataUrl = buildShareCardSvgDataUrl(opportunity);

    assert.match(dataUrl, /^data:image\/svg\+xml;charset=utf-8,/);
    assert.match(decodeURIComponent(dataUrl), /OPENTOP OPPORTUNITY/);
    assert.doesNotMatch(dataUrl, /\s<svg/);
  });

  it("escapes text before placing it into SVG markup", () => {
    const opportunity = {
      ...analyzeLocally(defaultInput).opportunities[0],
      name: `A <B> & "C"`
    };
    const svg = buildShareCardSvg(opportunity);

    assert.match(svg, /A &lt;B&gt; &amp; &quot;C&quot;/);
    assert.doesNotMatch(svg, /A <B> & "C"/);
  });
});

describe("launch text exports", () => {
  it("builds launch artifacts from one opportunity", () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const readme = buildReadmeBrief(opportunity.name, opportunity);
    const showHn = buildShowHnPost(opportunity);
    const xThread = buildXThread(opportunity);
    const reddit = buildRedditPost(opportunity);
    const issue = buildGitHubIssueBody(opportunity);
    const scaffold = buildRepoScaffoldPlan(opportunity);
    const launchKit = buildLaunchKit(opportunity);
    const contributorIssues = buildContributorIssueQueue(opportunity);
    const contributorQueue = buildContributorQueueMarkdown(opportunity);

    assert.match(readme, new RegExp(`# ${opportunity.name}`));
    assert.match(showHn, /^Show HN:/);
    assert.match(xThread, /^1\/ I am building/);
    assert.match(xThread, /8\/ The goal:/);
    assert.match(reddit, /^Title:/);
    assert.match(reddit, /I would like feedback/);
    assert.match(issue, /## First release scope/);
    assert.match(issue, /- \[ \] /);
    assert.match(issue, /Star potential:/);
    assert.match(scaffold, /## File Tree/);
    assert.match(scaffold, /README\.md/);
    assert.match(scaffold, /## Starter Issues/);
    assert.match(launchKit, /# .* Launch Kit/);
    assert.match(launchKit, /## Launch Checklist/);
    assert.match(launchKit, /## GitHub Issue Body/);
    assert.match(launchKit, /## Show HN Draft/);
    assert.match(launchKit, /## X Thread Draft/);
    assert.match(launchKit, /## Reddit Draft/);
    assert.match(launchKit, /## Contributor Queue/);
    assert.match(launchKit, new RegExp(opportunity.name));
    assert.ok(contributorIssues.length >= 5);
    assert.deepEqual(contributorIssues[0].labels, ["good-first-issue", "first-release", "help-wanted"]);
    assert.match(contributorIssues[0].body, /## Acceptance/);
    assert.match(contributorIssues[0].body, /- \[ \] Local tests and production build pass\./);
    assert.match(contributorQueue, /# .* Contributor Queue/);
    assert.match(contributorQueue, /Labels: `good-first-issue`/);
  });

  it("includes the selected scoring template in JSON opportunity exports", () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const profile = getScoringProfile("agent-debugging");
    const exported = buildOpportunityJsonExport(opportunity, profile);

    assert.equal(exported.name, opportunity.name);
    assert.deepEqual(exported.scoringTemplate, {
      id: profile.id,
      name: profile.name,
      bestFor: profile.bestFor,
      weights: profile.weights
    });
  });
});

describe("README star audit", () => {
  it("scores a launch-ready README with concrete adoption signals", () => {
    const audit = auditReadmeForStars(`# Local Agent Workbench

[![CI](https://github.com/acme/local-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/acme/local-agent/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Local Agent Workbench screenshot](docs/screenshot.png)

Local Agent Workbench helps AI engineers debug local agent runs without an API key. It runs locally, captures tool calls, and exports shareable examples.

Live demo: https://example.com/local-agent

## Quick Start

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Examples

See the sample gallery for before/after traces.

## Contributing

Open a good first issue or starter issue from the roadmap.

## Launch

Share the demo on Hacker News and Reddit after the first release.
`);

    assert.equal(audit.grade, "launch-ready");
    assert.ok(audit.score >= 82);
    assert.equal(audit.topFixes.length, 0);
  });

  it("finds high-leverage fixes for a vague README", () => {
    const audit = auditReadmeForStars(`# Idea

TODO`);
    const markdown = formatReadmeStarAudit(audit);

    assert.equal(audit.grade, "needs-work");
    assert.ok(audit.score < 58);
    assert.ok(audit.topFixes.length > 0);
    assert.match(audit.topFixes[0].fix, /who it helps|Quick Start|screenshot/i);
    assert.match(markdown, /# README Star Audit/);
    assert.match(markdown, /## Top Fixes/);
    assert.match(markdown, /## Checklist/);
  });

  it("parses GitHub repository URLs and owner/repo shorthand", () => {
    assert.deepEqual(parseGitHubRepoUrl("dhb118/opentop"), {
      owner: "dhb118",
      repo: "opentop",
      displayUrl: "https://github.com/dhb118/opentop",
      apiUrl: "https://api.github.com/repos/dhb118/opentop/readme"
    });
    assert.deepEqual(parseGitHubRepoUrl("https://github.com/openai/openai-node.git/issues/1"), {
      owner: "openai",
      repo: "openai-node",
      displayUrl: "https://github.com/openai/openai-node",
      apiUrl: "https://api.github.com/repos/openai/openai-node/readme"
    });
    assert.equal(parseGitHubRepoUrl("https://example.com/openai/openai-node"), null);
  });

  it("fetches and decodes a public GitHub README", async () => {
    const fetched = await fetchGitHubReadme("https://github.com/acme/local-agent", async (url) => {
      assert.equal(url, "https://api.github.com/repos/acme/local-agent/readme");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          encoding: "base64",
          content: Buffer.from("# Local Agent\n\nRuns locally without an API key.").toString("base64")
        })
      };
    });

    assert.equal(fetched.reference.displayUrl, "https://github.com/acme/local-agent");
    assert.match(fetched.readme, /Runs locally/);
  });

  it("reports unreadable GitHub README responses", async () => {
    await assert.rejects(
      fetchGitHubReadme("not a repo", async () => {
        throw new Error("should not fetch");
      }),
      /GitHub repository URL/
    );
    await assert.rejects(
      fetchGitHubReadme("acme/missing", async () => ({
        ok: false,
        status: 404,
        json: async () => ({})
      })),
      /Could not fetch README/
    );
  });

  it("scores GitHub repository profile signals", () => {
    const profile = buildGitHubRepoStarProfile({
      description: "A local-first TypeScript workbench for debugging AI agent runs.",
      homepage: "https://example.com/local-agent",
      topics: ["ai", "typescript", "agents"],
      stars: 42,
      forks: 5,
      openIssues: 8,
      license: "MIT",
      hasIssues: true,
      archived: false
    });
    const markdown = formatGitHubRepoStarProfile(profile);

    assert.equal(profile.grade, "growth-ready");
    assert.equal(profile.topFixes.length, 0);
    assert.match(markdown, /# GitHub Star Profile/);
    assert.match(markdown, /Stars: 42/);
    assert.match(markdown, /Topics: ai, typescript, agents/);
  });

  it("fetches and normalizes public GitHub repository metadata", async () => {
    const profile = await fetchGitHubRepoProfile("acme/local-agent", async (url) => {
      assert.equal(url, "https://api.github.com/repos/acme/local-agent");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          description: "Short",
          homepage: "",
          topics: ["ai"],
          stargazers_count: 0,
          forks_count: 0,
          open_issues_count: 0,
          license: null,
          has_issues: true,
          archived: false
        })
      };
    });

    assert.equal(profile.grade, "needs-foundation");
    assert.equal(profile.stats.stars, 0);
    assert.equal(profile.stats.topics.length, 1);
    assert.match(profile.topFixes[0].fix, /description|homepage|topics/i);
  });
});

describe("downloadable repo scaffold", () => {
  it("builds the required starter repository files with safe deterministic paths", () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const root = repoScaffoldRootName(opportunity);
    const files = buildRepoScaffoldFiles(opportunity);
    const paths = files.map((file) => file.path);

    assert.equal(root, "developers-radar");
    assert.equal(repoScaffoldRootName({ ...opportunity, name: "Agent / Trace <> Notebook!" }), "agent-trace-notebook");
    assert.deepEqual(paths, [
      `${root}/README.md`,
      `${root}/LICENSE`,
      `${root}/package.json`,
      `${root}/tsconfig.json`,
      `${root}/src/index.ts`,
      `${root}/src/app.ts`,
      `${root}/src/scoring.ts`,
      `${root}/tests/scoring.test.ts`,
      `${root}/docs/launch-plan.md`,
      `${root}/docs/examples.md`,
      `${root}/.github/workflows/ci.yml`,
      `${root}/.github/ISSUE_TEMPLATE/feature_request.yml`
    ]);
    assert.equal(paths.every((path) => path.startsWith(`${root}/`) && !path.includes("..") && !path.includes("//")), true);

    const packageFile = files.find((file) => file.path.endsWith("/package.json"));
    assert.equal(JSON.parse(packageFile?.content ?? "{}").name, root);
  });

  it("builds a deterministic dependency-free ZIP archive", () => {
    const opportunity = analyzeLocally(defaultInput).opportunities[0];
    const first = buildRepoScaffoldZipBytes(opportunity);
    const second = buildRepoScaffoldZipBytes(opportunity);
    const zipText = new TextDecoder().decode(first);

    assert.deepEqual(first, second);
    assert.equal(first[0], 0x50);
    assert.equal(first[1], 0x4b);
    assert.match(zipText, /README\.md/);
    assert.match(zipText, /package\.json/);
    assert.match(zipText, /src\/app\.ts/);
    assert.match(zipText, /tests\/scoring\.test\.ts/);
    assert.match(zipText, /\.github\/workflows\/ci\.yml/);
  });
});

describe("opportunity keyboard navigation", () => {
  it("moves through opportunity cards with arrow keys and clamps at edges", () => {
    assert.equal(nextOpportunityIndex(0, 5, "ArrowDown"), 1);
    assert.equal(nextOpportunityIndex(1, 5, "ArrowRight"), 2);
    assert.equal(nextOpportunityIndex(4, 5, "ArrowDown"), 4);
    assert.equal(nextOpportunityIndex(0, 5, "ArrowUp"), 0);
    assert.equal(nextOpportunityIndex(3, 5, "ArrowLeft"), 2);
  });

  it("supports Home and End navigation keys", () => {
    assert.equal(nextOpportunityIndex(3, 5, "Home"), 0);
    assert.equal(nextOpportunityIndex(1, 5, "End"), 4);
    assert.equal(nextOpportunityIndex(0, 0, "End"), -1);
  });

  it("recognizes only opportunity navigation keys", () => {
    assert.equal(isOpportunityNavigationKey("ArrowDown"), true);
    assert.equal(isOpportunityNavigationKey("Enter"), false);
    assert.equal(isOpportunityNavigationKey(" "), false);
  });
});

describe("trend CSV import", () => {
  it("turns source and signal rows into a signal brief", () => {
    const parsed = parseTrendCsv(`source,signal
HN,"Developers want local-first AI debugging"
GitHub,Prompt regression tools are getting starred`);

    assert.equal(parsed?.rowCount, 2);
    assert.equal(parsed?.channels, "HN, GitHub");
    assert.match(parsed?.signal ?? "", /HN: Developers want local-first AI debugging/);
    assert.match(parsed?.signal ?? "", /GitHub: Prompt regression tools are getting starred/);
  });

  it("handles simple newline rows without a header", () => {
    const parsed = parseTrendCsv(`Reddit,Local model setup is still painful
Issues,Maintainers need better README positioning`);

    assert.equal(parsed?.rowCount, 2);
    assert.match(parsed?.channels ?? "", /Reddit/);
  });

  it("returns null when no usable signal exists", () => {
    assert.equal(parseTrendCsv("source,signal\n,"), null);
  });
});

describe("trend notes import", () => {
  it("turns Markdown bullets into a signal brief", () => {
    const parsed = parseTrendNotes(`- HN: Developers want local-first AI debugging
- GitHub: Prompt regression tools are getting starred
- Reddit: Local model setup is still painful`);

    assert.equal(parsed?.format, "notes");
    assert.equal(parsed?.rowCount, 3);
    assert.equal(parsed?.ignoredCount, 0);
    assert.equal(parsed?.channels, "HN, GitHub, Reddit");
    assert.match(parsed?.signal ?? "", /HN: Developers want local-first AI debugging/);
  });

  it("keeps Markdown link text and URL when importing notes", () => {
    const parsed = parseTrendNotes(`* GitHub: [Maintainers want release notes](https://github.com/example/repo/issues/1)`);

    assert.equal(parsed?.rowCount, 1);
    assert.match(parsed?.signal ?? "", /Maintainers want release notes https:\/\/github.com\/example\/repo\/issues\/1/);
  });

  it("auto-detects CSV while accepting notes by default", () => {
    assert.equal(parseTrendSignals("source,signal\nHN,Builders want smaller AI tools")?.format, "csv");
    assert.equal(parseTrendSignals("- HN: Builders want smaller AI tools")?.format, "notes");
  });

  it("counts short noise lines as ignored notes", () => {
    const parsed = parseTrendNotes(`todo
- GitHub: Maintainers need prompt regression examples`);

    assert.equal(parsed?.rowCount, 1);
    assert.equal(parsed?.ignoredCount, 1);
  });
});

describe("trend link import", () => {
  it("turns browser bookmark anchors into source and signal rows", () => {
    const parsed = parseTrendLinks(`
      <!DOCTYPE NETSCAPE-Bookmark-file-1>
      <DT><A HREF="https://news.ycombinator.com/item?id=4242">Local-first AI launch thread</A>
      <DT><A HREF="https://www.example.com/agent-tools/">Agent tools directory</A>
    `);

    assert.equal(parsed?.format, "links");
    assert.equal(parsed?.rowCount, 2);
    assert.equal(parsed?.ignoredCount, 0);
    assert.equal(parsed?.channels, "news.ycombinator.com, example.com");
    assert.match(parsed?.signal ?? "", /news\.ycombinator\.com: Local-first AI launch thread - https:\/\/news\.ycombinator\.com\/item\?id=4242/);
    assert.match(parsed?.signal ?? "", /example\.com: Agent tools directory - https:\/\/www\.example\.com\/agent-tools/);
  });

  it("deduplicates copied links and counts invalid rows", () => {
    const parsed = parseTrendLinks(`
      Local AI launch guide https://example.com/ai-launch/
      https://example.com/ai-launch/#comments
      not a url
      [OpenAI cookbook](https://github.com/openai/openai-cookbook)
    `);

    assert.equal(parsed?.format, "links");
    assert.equal(parsed?.rowCount, 2);
    assert.equal(parsed?.ignoredCount, 2);
    assert.equal(parsed?.channels, "example.com, github.com");
    assert.match(parsed?.signal ?? "", /example\.com: Local AI launch guide - https:\/\/example\.com\/ai-launch/);
    assert.match(parsed?.signal ?? "", /github\.com: OpenAI cookbook - https:\/\/github\.com\/openai\/openai-cookbook/);
  });

  it("auto-detects link lists without stealing source-prefixed Markdown notes", () => {
    assert.equal(parseTrendSignals("Local AI launch guide https://example.com/ai-launch")?.format, "links");
    assert.equal(
      parseTrendSignals("* GitHub: [Maintainers want release notes](https://github.com/example/repo/issues/1)")
        ?.format,
      "notes"
    );
  });
});

describe("GitHub issue trend import", () => {
  it("parses and deduplicates public GitHub issue URLs", () => {
    const refs = parseGitHubIssueUrls(`
      https://github.com/openai/codex/issues/42
      See also https://github.com/OpenAI/codex/issues/42?comment=1
      https://github.com/example/repo.name/issues/7#issuecomment-1
    `);

    assert.deepEqual(refs, [
      {
        owner: "openai",
        repo: "codex",
        number: 42,
        url: "https://github.com/openai/codex/issues/42"
      },
      {
        owner: "example",
        repo: "repo.name",
        number: 7,
        url: "https://github.com/example/repo.name/issues/7"
      }
    ]);
  });

  it("fetches public issues without credentials and keeps source links visible", async () => {
    const requested = [];
    const parsed = await fetchGitHubIssueSignals("https://github.com/example/opentop/issues/12", async (url, init) => {
      requested.push({ url, init });
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          title: "Import feedback loops from issues",
          body: "Developers ask for [trend import](https://example.com) and clearer launch signals.",
          html_url: "https://github.com/example/opentop/issues/12",
          state: "open",
          labels: [{ name: "growth" }, { name: "scoring" }]
        })
      };
    });

    assert.equal(requested[0].url, "https://api.github.com/repos/example/opentop/issues/12");
    assert.equal(requested[0].init.headers.Accept, "application/vnd.github+json");
    assert.equal(parsed?.format, "github-issues");
    assert.equal(parsed?.rowCount, 1);
    assert.equal(parsed?.channels, "GitHub example/opentop#12");
    assert.match(parsed?.signal ?? "", /Import feedback loops from issues/);
    assert.match(parsed?.signal ?? "", /trend import/);
    assert.match(parsed?.signal ?? "", /labels: growth, scoring/);
    assert.match(parsed?.signal ?? "", /https:\/\/github.com\/example\/opentop\/issues\/12/);
  });

  it("reports partial GitHub issue import failures", async () => {
    const parsed = await fetchGitHubIssueSignals(
      "https://github.com/example/opentop/issues/12\nhttps://github.com/example/opentop/issues/99",
      async (url) => {
        if (url.endsWith("/99")) {
          return { ok: false, status: 404, statusText: "Not Found", json: async () => ({}) };
        }
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => ({
            title: "Maintainers want launchable issue briefs",
            body: "Issue body becomes a signal.",
            html_url: "https://github.com/example/opentop/issues/12",
            state: "open",
            labels: []
          })
        };
      }
    );

    assert.equal(parsed?.rowCount, 1);
    assert.equal(parsed?.ignoredCount, 1);
    assert.deepEqual(parsed?.failures, ["example/opentop#99: 404 Not Found"]);
  });
});

describe("model response repair", () => {
  it("parses fenced JSON model output", () => {
    const parsed = parseModelAnalysis(`\`\`\`json
${JSON.stringify({ summary: "ok", opportunities: [analyzeLocally(defaultInput).opportunities[0]] })}
\`\`\``);

    assert.equal(parsed.generatedBy, "model");
    assert.equal(parsed.summary, "ok");
    assert.equal(parsed.opportunities.length, 1);
  });

  it("repairs prose-wrapped JSON and clamps scores", () => {
    const parsed = parseModelAnalysis(`Here is the result:
{"summary":"wrapped","opportunities":[{"name":"Wrapped Idea","score":99,"scores":{"pain":11,"urgency":0,"distribution":"8","buildability":7,"starPotential":6}}]}
Thanks.`);

    assert.equal(parsed.opportunities[0].score, 10);
    assert.equal(parsed.opportunities[0].scores.pain, 10);
    assert.equal(parsed.opportunities[0].scores.urgency, 1);
    assert.equal(parsed.opportunities[0].scores.distribution, 8);
  });

  it("rejects model output without valid opportunities", () => {
    assert.throws(() => parseModelAnalysis(`{"summary":"empty","opportunities":[]}`), /valid opportunities/);
  });
});

describe("Pages smoke check helpers", () => {
  it("extracts unique deploy asset URLs relative to the Pages URL", () => {
    const assets = extractAssetUrls(
      `<link rel="stylesheet" href="./assets/index.css">
<script type="module" src="./assets/index.js"></script>
<script type="module" src="./assets/index.js"></script>`,
      "https://dhb118.github.io/opentop/"
    );

    assert.deepEqual(assets, [
      "https://dhb118.github.io/opentop/assets/index.css",
      "https://dhb118.github.io/opentop/assets/index.js"
    ]);
  });

  it("resolves smoke check defaults from package metadata and environment overrides", () => {
    const options = resolveSmokeOptions(
      ["--expect", "OpenTop"],
      { OPENTOP_PAGES_URL: "https://example.com/demo/" },
      JSON.stringify({ homepage: "https://fallback.example.com/" })
    );

    assert.equal(options.url, "https://example.com/demo/");
    assert.equal(options.expectedText, "OpenTop");
  });
});

describe("GitHub label sync", () => {
  it("parses committed labels into GitHub API payloads", async () => {
    const labels = parseLabelsYaml(await readFile(".github/labels.yml", "utf8"));

    assert.equal(labels.length, 8);
    assert.deepEqual(labels[0], {
      name: "good-first-opportunity",
      color: "D8FF4F",
      description: "Small contribution that improves OpenTop's launch value."
    });
    assert.ok(labels.every((label) => /^[0-9A-F]{6}$/.test(label.color)));
  });
});
