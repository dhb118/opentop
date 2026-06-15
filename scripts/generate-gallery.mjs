import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { analyzeLocally } from "../src/opportunityEngine.ts";
import { sampleBriefs } from "../src/sampleBriefs.ts";
import { createShareUrl } from "../src/urlState.ts";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const demoUrl = readDemoUrl();

function readDemoUrl() {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
  return packageJson.homepage ?? "https://dhb118.github.io/opentop/";
}

export function buildGallery() {
  return sampleBriefs.map((brief) => {
    const analysis = analyzeLocally(brief.input);
    const top = analysis.opportunities[0];
    return {
      id: brief.id,
      title: brief.title,
      shareUrl: createShareUrl(brief.input, demoUrl),
      summary: analysis.summary,
      topOpportunity: top,
      alternatives: analysis.opportunities.slice(1, 4)
    };
  });
}

export function buildGalleryJson() {
  return `${JSON.stringify(buildGallery(), null, 2)}\n`;
}

export function buildGalleryMarkdown() {
  const entries = buildGallery()
    .map((entry) => {
      const alternatives = entry.alternatives
        .map((item) => `- ${item.name}: ${item.score}/10 - ${item.wedge}`)
        .join("\n");

      return `## ${entry.title}

[Open this brief in OpenTop](${entry.shareUrl})

${entry.summary}

### Top Opportunity

- Name: ${entry.topOpportunity.name}
- Score: ${entry.topOpportunity.score}/10
- Hook: ${entry.topOpportunity.repoHook}
- Wedge: ${entry.topOpportunity.wedge}
- Differentiator: ${entry.topOpportunity.differentiator}

### First Release

${entry.topOpportunity.firstRelease.map((item) => `- ${item}`).join("\n")}

### Alternatives

${alternatives}
`;
    })
    .join("\n");

  return `# OpenTop Opportunity Gallery

These examples are generated from the built-in sample briefs with the local scoring engine. They give visitors concrete outputs before they run the app and create searchable material for the repository.

${entries}
`;
}

export function buildSampleBriefsMarkdown() {
  const entries = sampleBriefs
    .map(
      (brief) => `## ${brief.title}

Audience: ${brief.input.audience}.

Signal: ${brief.input.signal}

Constraints: ${brief.input.constraints}.

Channels: ${brief.input.channels}.

Scores: pain ${brief.input.pain}/10, urgency ${brief.input.urgency}/10, distribution ${brief.input.distribution}/10.
`
    )
    .join("\n");

  return `# Sample Opportunity Briefs

Use these examples to test OpenTop and to show visitors what the app produces. Each brief is a concrete AI builder pain with enough context to generate ranked opportunities, launch artifacts, and starter repo ideas.

${entries}`;
}

async function main() {
  await writeFile(join(projectRoot, "docs", "GALLERY.md"), buildGalleryMarkdown());
  await writeFile(join(projectRoot, "docs", "SAMPLE_BRIEFS.md"), buildSampleBriefsMarkdown());
  await writeFile(join(projectRoot, "public", "gallery.json"), buildGalleryJson());
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
