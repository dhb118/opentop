import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const defaultLabelsFile = ".github/labels.yml";

export function parseLabelsYaml(source) {
  const labels = [];
  let current = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("- ")) {
      if (current) {
        labels.push(current);
      }
      current = {};
      assignYamlPair(current, line.slice(2).trim());
      continue;
    }

    if (!current) {
      throw new Error(`Unexpected labels.yml line before first label: ${line}`);
    }
    assignYamlPair(current, line);
  }

  if (current) {
    labels.push(current);
  }

  return labels.map(validateLabel);
}

export async function syncLabels({ dryRun = false, file = defaultLabelsFile, repo, token }) {
  const labels = parseLabelsYaml(await readFile(file, "utf8"));

  if (dryRun) {
    const targetRepo = repo ?? "local";
    for (const label of labels) {
      console.log(`DRY-RUN ${targetRepo}: ${label.name} #${label.color} - ${label.description}`);
    }
    return { labels, synced: 0 };
  }

  if (!repo) {
    throw new Error("Missing repository. Pass --repo owner/name or set GITHUB_REPOSITORY.");
  }

  if (!token) {
    throw new Error("Missing GitHub token. Set GITHUB_TOKEN or run with --dry-run.");
  }

  let synced = 0;
  for (const label of labels) {
    await upsertLabel(repo, token, label);
    synced += 1;
    console.log(`SYNCED ${repo}: ${label.name}`);
  }

  return { labels, synced };
}

function assignYamlPair(target, pair) {
  const separator = pair.indexOf(":");
  if (separator < 0) {
    throw new Error(`Invalid labels.yml line: ${pair}`);
  }

  const key = pair.slice(0, separator).trim();
  const value = stripQuotes(pair.slice(separator + 1).trim());
  target[key] = value;
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function validateLabel(label) {
  const name = String(label.name ?? "").trim();
  const color = String(label.color ?? "").replace(/^#/, "").trim();
  const description = String(label.description ?? "").trim();

  if (!name) {
    throw new Error("Label is missing a name.");
  }
  if (!/^[0-9a-f]{6}$/i.test(color)) {
    throw new Error(`Label ${name} has invalid 6-digit hex color: ${color}`);
  }
  if (!description) {
    throw new Error(`Label ${name} is missing a description.`);
  }

  return { name, color: color.toUpperCase(), description };
}

async function upsertLabel(repo, token, label) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "opentop-label-sync",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  const base = `https://api.github.com/repos/${repo}/labels`;
  const encodedName = encodeURIComponent(label.name);
  const existing = await fetch(`${base}/${encodedName}`, { headers });
  const body = JSON.stringify(label);

  if (existing.status === 404) {
    await assertOk(
      fetch(base, {
        method: "POST",
        headers,
        body
      }),
      `create label ${label.name}`
    );
    return;
  }

  await assertOk(
    fetch(`${base}/${encodedName}`, {
      method: "PATCH",
      headers,
      body
    }),
    `update label ${label.name}`
  );
}

async function assertOk(responsePromise, action) {
  const response = await responsePromise;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to ${action}: ${response.status} ${response.statusText} ${detail}`);
  }
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    file: defaultLabelsFile,
    repo: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--file") {
      options.file = argv[(index += 1)];
    } else if (arg === "--repo") {
      options.repo = argv[(index += 1)];
    } else if (arg === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-labels.mjs [--dry-run] [--repo owner/name] [--file .github/labels.yml]

Environment:
  GITHUB_TOKEN        Token with Issues write permission.
  GITHUB_REPOSITORY   owner/name repository slug.
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const result = await syncLabels(options);
  console.log(`${options.dryRun ? "Validated" : "Synced"} ${result.labels.length} labels.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
