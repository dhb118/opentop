import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const repoFullName = "dhb118/opentop";

export function buildRepoProfile(packageJsonText = readPackageJson()) {
  const packageJson = JSON.parse(packageJsonText);
  const packageKeywords = Array.isArray(packageJson.keywords) ? packageJson.keywords : [];
  const topics = uniqueTopics([...packageKeywords, "ai-tools", "developer-tools", "launch-tools", "github-readme"]);

  return {
    description: packageJson.description,
    homepage: packageJson.homepage,
    pinnedIssue: "https://github.com/dhb118/opentop/issues/12",
    repo: repoFullName,
    socialPreviewAlt:
      "OpenTop interface showing AI opportunity scoring, sample briefs, and launch exports for open-source builders.",
    topics
  };
}

export function buildRepoProfileMarkdown(profile = buildRepoProfile()) {
  return `# OpenTop GitHub Repo Profile Pack

Use this before sending launch traffic to GitHub. The repository About panel is part of the first-screen conversion path for stars.

## GitHub About

- Description: ${profile.description}
- Website: ${profile.homepage}
- Topics: ${profile.topics.map((topic) => `\`${topic}\``).join(", ")}
- Pinned issue: ${profile.pinnedIssue}
- Social preview alt text: ${profile.socialPreviewAlt}

## GitHub CLI

\`\`\`bash
${buildGhCommands(profile).join("\n")}
\`\`\`

## Web UI Checklist

- [ ] Open the repository About settings.
- [ ] Paste the description exactly as shown above.
- [ ] Set Website to the verified fallback demo until native GitHub Pages works.
- [ ] Add every topic listed above.
- [ ] Pin the fallback demo issue so visitors see the current hosted path and remaining Pages blocker.
- [ ] Confirm the public repository page shows the description, Website, topics, license, issues, and README screenshot above the fold.

## Audit Command

\`\`\`bash
pnpm repo:profile:audit
\`\`\`

The audit reads public GitHub metadata and reports whether the profile matches this pack. It does not require secrets and does not mutate GitHub.
`;
}

export function buildGhCommands(profile = buildRepoProfile()) {
  const topics = profile.topics.map((topic) => `--add-topic ${topic}`).join(" ");
  return [
    `gh repo edit ${profile.repo} --description ${quoteForShell(profile.description)}`,
    `gh repo edit ${profile.repo} --homepage ${profile.homepage}`,
    `gh repo edit ${profile.repo} --enable-issues`,
    `gh repo edit ${profile.repo} ${topics}`
  ];
}

export async function auditRepoProfile({ fetchImpl = fetch, profile = buildRepoProfile() } = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "opentop-repo-profile-audit"
  };
  let repoResponse;
  let topicsResponse;

  try {
    [repoResponse, topicsResponse] = await Promise.all([
      fetchImpl(`https://api.github.com/repos/${profile.repo}`, { headers }),
      fetchImpl(`https://api.github.com/repos/${profile.repo}/topics`, { headers })
    ]);
  } catch (error) {
    return {
      checks: [["GitHub repository is reachable", false, formatError(error)]],
      observed: null,
      profile
    };
  }

  if (!repoResponse.ok) {
    return {
      checks: [["GitHub repository is reachable", false, `${repoResponse.status} ${repoResponse.statusText}`]],
      observed: null,
      profile
    };
  }

  const repo = await repoResponse.json();
  const topics = topicsResponse.ok ? await topicsResponse.json() : { names: [] };
  const observedTopics = Array.isArray(topics.names) ? topics.names : [];
  const missingTopics = profile.topics.filter((topic) => !observedTopics.includes(topic));
  const observed = {
    description: readString(repo.description),
    homepage: readString(repo.homepage),
    hasIssues: repo.has_issues === true,
    topics: observedTopics
  };

  return {
    checks: [
      ["GitHub repository is reachable", true, profile.repo],
      ["About description matches", observed.description === profile.description, observed.description || "none"],
      ["Homepage points to verified demo", observed.homepage === profile.homepage, observed.homepage || "none"],
      [
        "Discovery topics are present",
        missingTopics.length === 0,
        missingTopics.length === 0 ? observedTopics.join(", ") : `missing: ${missingTopics.join(", ")}`
      ],
      ["Issues are enabled", observed.hasIssues, observed.hasIssues ? "enabled" : "disabled"]
    ],
    observed,
    profile
  };
}

function readPackageJson() {
  return readFileSync(new URL("../package.json", import.meta.url), "utf8");
}

function readString(value) {
  return typeof value === "string" ? value : "";
}

function uniqueTopics(values) {
  const topics = [];
  for (const value of values) {
    const topic = String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
    if (!topic || topics.includes(topic)) {
      continue;
    }
    topics.push(topic);
  }
  return topics.slice(0, 20);
}

function quoteForShell(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

async function main() {
  const profile = buildRepoProfile();
  if (process.argv.includes("--audit")) {
    const result = await auditRepoProfile({ profile });
    for (const [label, ok, detail] of result.checks) {
      console.log(`${ok ? "PASS" : "WARN"} ${label}: ${detail}`);
    }
    return;
  }

  console.log(buildRepoProfileMarkdown(profile));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
