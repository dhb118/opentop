import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultInput } from "../src/domain.ts";
import { analyzeLocally } from "../src/opportunityEngine.ts";

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
