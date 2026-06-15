import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { defaultInput } from "../src/domain.ts";
import { buildGitHubIssueBody, buildReadmeBrief, buildRepoScaffoldPlan, buildShowHnPost } from "../src/launchExports.ts";
import { parseModelAnalysis } from "../src/modelResponse.ts";
import { analyzeLocally, scoreWeights } from "../src/opportunityEngine.ts";
import { buildShareCardSvg, buildShareCardSvgDataUrl, shareCardDimensions } from "../src/shareCard.ts";
import { parseTrendCsv, parseTrendNotes, parseTrendSignals } from "../src/trendImport.ts";
import { createShareUrl, decodeBrief, encodeBrief, readBriefFromSearch } from "../src/urlState.ts";
import { buildGalleryJson, buildGalleryMarkdown } from "../scripts/generate-gallery.mjs";
import { extractAssetUrls, resolveSmokeOptions } from "../scripts/smoke-pages.mjs";

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

describe("generated opportunity gallery", () => {
  it("keeps committed gallery files synchronized with sample briefs", async () => {
    const [markdown, json] = await Promise.all([
      readFile("docs/GALLERY.md", "utf8"),
      readFile("public/gallery.json", "utf8")
    ]);

    assert.equal(markdown, buildGalleryMarkdown());
    assert.equal(json, buildGalleryJson());
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
    const issue = buildGitHubIssueBody(opportunity);
    const scaffold = buildRepoScaffoldPlan(opportunity);

    assert.match(readme, new RegExp(`# ${opportunity.name}`));
    assert.match(showHn, /^Show HN:/);
    assert.match(issue, /## First release scope/);
    assert.match(issue, /- \[ \] /);
    assert.match(issue, /Star potential:/);
    assert.match(scaffold, /## File Tree/);
    assert.match(scaffold, /README\.md/);
    assert.match(scaffold, /## Starter Issues/);
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
