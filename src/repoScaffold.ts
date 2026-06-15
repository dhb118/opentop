import type { Opportunity } from "./domain.ts";

export interface RepoScaffoldFile {
  path: string;
  content: string;
}

const textEncoder = new TextEncoder();
const zipDate = (1 << 5) | 1;
const zipTime = 0;
let crcTable: Uint32Array | null = null;

export function repoScaffoldRootName(item: Opportunity): string {
  return slugify(item.name) || "opentop-scaffold";
}

export function buildRepoScaffoldFiles(item: Opportunity): RepoScaffoldFile[] {
  const root = repoScaffoldRootName(item);
  const packageName = root.toLowerCase();

  return [
    {
      path: `${root}/README.md`,
      content: buildScaffoldReadme(item)
    },
    {
      path: `${root}/LICENSE`,
      content: `MIT License

Copyright (c) 2026 ${item.name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`
    },
    {
      path: `${root}/package.json`,
      content: `${JSON.stringify(
        {
          name: packageName,
          version: "0.1.0",
          description: item.tagline,
          type: "module",
          private: false,
          packageManager: "pnpm@10.0.0",
          scripts: {
            build: "tsc --noEmit",
            test: "tsx --test tests/*.test.ts",
            check: "pnpm test && pnpm build"
          },
          keywords: ["ai", "typescript", "open-source"],
          license: "MIT",
          devDependencies: {
            "@types/node": "^22.0.0",
            tsx: "^4.19.0",
            typescript: "^5.8.3"
          }
        },
        null,
        2
      )}
`
    },
    {
      path: `${root}/tsconfig.json`,
      content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests"]
}
`
    },
    {
      path: `${root}/src/index.ts`,
      content: `import { buildLaunchChecklist, opportunity } from "./app.js";
import { scoreOpportunity } from "./scoring.js";

const score = scoreOpportunity(opportunity.scores);

console.log(\`\${opportunity.name}: \${score}/10\`);
console.log(buildLaunchChecklist().join("\\n"));
`
    },
    {
      path: `${root}/src/app.ts`,
      content: `export const opportunity = {
  name: ${JSON.stringify(item.name)},
  tagline: ${JSON.stringify(item.tagline)},
  targetUser: ${JSON.stringify(item.targetUser)},
  wedge: ${JSON.stringify(item.wedge)},
  differentiator: ${JSON.stringify(item.differentiator)},
  firstRelease: ${JSON.stringify(item.firstRelease, null, 2)},
  launchPlan: ${JSON.stringify(item.launchPlan, null, 2)},
  scores: ${JSON.stringify(item.scores, null, 2)}
} as const;

export function buildLaunchChecklist(): string[] {
  return [
    "Validate the wedge with 3 target users.",
    ...opportunity.firstRelease.map((item) => \`Ship: \${item}\`),
    ...opportunity.launchPlan.map((item) => \`Launch: \${item}\`)
  ];
}
`
    },
    {
      path: `${root}/src/scoring.ts`,
      content: `export interface ScoreBreakdown {
  pain: number;
  urgency: number;
  distribution: number;
  buildability: number;
  starPotential: number;
}

const weights: Record<keyof ScoreBreakdown, number> = {
  pain: 0.26,
  urgency: 0.18,
  distribution: 0.22,
  buildability: 0.16,
  starPotential: 0.18
};

export function scoreOpportunity(scores: ScoreBreakdown): number {
  const weighted = Object.entries(weights).reduce((total, [key, weight]) => {
    const value = clampScore(scores[key as keyof ScoreBreakdown]);
    return total + value * weight;
  }, 0);

  return Math.round(weighted);
}

function clampScore(value: number): number {
  return Math.min(10, Math.max(1, Number.isFinite(value) ? value : 1));
}
`
    },
    {
      path: `${root}/tests/scoring.test.ts`,
      content: `import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreOpportunity } from "../src/scoring.js";

test("scoreOpportunity returns a bounded public score", () => {
  const score = scoreOpportunity({
    pain: 10,
    urgency: 8,
    distribution: 9,
    buildability: 7,
    starPotential: 8
  });

  assert.equal(score, 9);
});
`
    },
    {
      path: `${root}/docs/launch-plan.md`,
      content: `# Launch Plan

${item.launchPlan.map((entry) => `- [ ] ${entry}`).join("\n")}

## Risks to watch

${item.risks.map((entry) => `- ${entry}`).join("\n")}
`
    },
    {
      path: `${root}/docs/examples.md`,
      content: `# Examples

Use this file to collect screenshots, prompts, command output, and before/after examples.

## First release scope

${item.firstRelease.map((entry) => `- ${entry}`).join("\n")}
`
    },
    {
      path: `${root}/.github/workflows/ci.yml`,
      content: `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: corepack enable
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
`
    },
    {
      path: `${root}/.github/ISSUE_TEMPLATE/feature_request.yml`,
      content: `name: Feature request
description: Propose a focused improvement.
title: "[Feature]: "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What user pain should this solve?
    validations:
      required: true
  - type: textarea
    id: scope
    attributes:
      label: First release scope
      description: What is the smallest useful version?
    validations:
      required: true
`
    }
  ];
}

export function buildRepoScaffoldZipBlob(item: Opportunity): Blob {
  return new Blob([buildRepoScaffoldZipBytes(item)], { type: "application/zip" });
}

export function buildRepoScaffoldZipBytes(item: Opportunity): Uint8Array {
  return buildZip(buildRepoScaffoldFiles(item));
}

function buildScaffoldReadme(item: Opportunity): string {
  return `# ${item.name}

${item.repoHook}

## Target user

${item.targetUser}

## Wedge

${item.wedge}

## Why this is different

${item.differentiator}

## Quick start

\`\`\`bash
pnpm install
pnpm test
pnpm build
\`\`\`

## First release

${item.firstRelease.map((entry) => `- [ ] ${entry}`).join("\n")}

## Launch plan

${item.launchPlan.map((entry) => `- [ ] ${entry}`).join("\n")}
`;
}

function buildZip(files: RepoScaffoldFile[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const filename = normalizeZipPath(file.path);
    const nameBytes = textEncoder.encode(filename);
    const contentBytes = textEncoder.encode(file.content);
    const crc = crc32(contentBytes);
    const localHeader = createLocalFileHeader(nameBytes.length, contentBytes.length, crc);
    const centralHeader = createCentralDirectoryHeader(nameBytes.length, contentBytes.length, crc, offset);

    localParts.push(localHeader, nameBytes, contentBytes);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = createEndRecord(files.length, centralSize, centralOffset);

  return concatBytes([...localParts, ...centralParts, endRecord]);
}

function createLocalFileHeader(filenameLength: number, size: number, crc: number): Uint8Array {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, zipTime, true);
  view.setUint16(12, zipDate, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, filenameLength, true);
  view.setUint16(28, 0, true);
  return header;
}

function createCentralDirectoryHeader(filenameLength: number, size: number, crc: number, offset: number): Uint8Array {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, zipTime, true);
  view.setUint16(14, zipDate, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, filenameLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  return header;
}

function createEndRecord(entries: number, centralSize: number, centralOffset: number): Uint8Array {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entries, true);
  view.setUint16(10, entries, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return header;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function crc32(bytes: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function getCrcTable(): Uint32Array {
  if (crcTable) {
    return crcTable;
  }

  crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crcTable[index] = value >>> 0;
  }

  return crcTable;
}

function normalizeZipPath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\/+/, "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
