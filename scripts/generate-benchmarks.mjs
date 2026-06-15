import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { benchmarkRepos } from "../src/benchmarkRepos.ts";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const generatedDate = "2026-06-15";

export function buildBenchmarks() {
  return benchmarkRepos;
}

export function buildBenchmarksJson() {
  return `${JSON.stringify(buildBenchmarks(), null, 2)}\n`;
}

export function buildBenchmarksMarkdown() {
  const rows = benchmarkRepos
    .map(
      (item) => `## ${item.repo}

- Source: [repository](${item.url}) / [evidence](${item.sourceUrl})
- OpenTop dimension: \`${item.dimension}\`
- Public signal: ${item.publicSignal}
- Lesson: ${item.lesson}
- Use in OpenTop: ${item.openTopUse}
`
    )
    .join("\n");

  return `# AI Repo Benchmarks

These benchmark examples map visible public repository signals to OpenTop scoring dimensions. They avoid private metrics and avoid hard-coding star counts; the point is to show what a visitor can inspect before deciding whether an AI app idea has a credible path to GitHub distribution.

Facts were checked against public GitHub repository metadata and linked README/docs sources on ${generatedDate}.

${rows}`;
}

async function main() {
  await writeFile(join(projectRoot, "docs", "BENCHMARKS.md"), buildBenchmarksMarkdown());
  await writeFile(join(projectRoot, "public", "benchmarks.json"), buildBenchmarksJson());
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
