import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { analyzeLocally } from "../src/opportunityEngine.ts";
import { sampleBriefs } from "../src/sampleBriefs.ts";
import { createShareUrl } from "../src/urlState.ts";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const demoUrl = "https://dhb118.github.io/opentop/";

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

async function main() {
  await writeFile(join(projectRoot, "docs", "GALLERY.md"), buildGalleryMarkdown());
  await writeFile(join(projectRoot, "public", "gallery.json"), buildGalleryJson());
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
