import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { defaultInput } from "../src/domain.ts";
import { analyzeLocally } from "../src/opportunityEngine.ts";
import { buildShareCardSvg } from "../src/shareCard.ts";
import { createShareUrl, decodeBrief, encodeBrief, readBriefFromSearch } from "../src/urlState.ts";
import { buildGalleryJson, buildGalleryMarkdown } from "../scripts/generate-gallery.mjs";

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

    assert.match(svg, /^<svg width="1200" height="630"/);
    assert.match(svg, /OPENTOP OPPORTUNITY/);
    assert.match(svg, new RegExp(opportunity.name));
    assert.match(svg, /image\/svg\+xml|<\/svg>/);
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
