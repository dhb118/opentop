import type { BenchmarkDimension, BenchmarkRepo } from "./benchmarkRepos.ts";
import type { Opportunity } from "./domain.ts";

export interface BenchmarkComparison {
  repo: string;
  url: string;
  sourceUrl: string;
  dimension: BenchmarkDimension;
  dimensionLabel: string;
  score: number;
  signal: string;
  lesson: string;
  use: string;
  alignment: "strong" | "watch" | "gap";
}

export function buildBenchmarkComparisons(
  opportunity: Opportunity,
  benchmarks: BenchmarkRepo[]
): BenchmarkComparison[] {
  return benchmarks.map((benchmark) => {
    const score = opportunity.scores[benchmark.dimension];

    return {
      repo: benchmark.repo,
      url: benchmark.url,
      sourceUrl: benchmark.sourceUrl,
      dimension: benchmark.dimension,
      dimensionLabel: labelForDimension(benchmark.dimension),
      score,
      signal: benchmark.publicSignal,
      lesson: benchmark.lesson,
      use: benchmark.openTopUse,
      alignment: alignmentForScore(score)
    };
  });
}

export function labelForDimension(dimension: BenchmarkDimension): string {
  if (dimension === "starPotential") {
    return "Star potential";
  }
  return dimension.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase());
}

function alignmentForScore(score: number): BenchmarkComparison["alignment"] {
  if (score >= 8) {
    return "strong";
  }
  if (score >= 6) {
    return "watch";
  }
  return "gap";
}
