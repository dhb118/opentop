export interface ReadmeAuditItem {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  evidence: string;
  fix: string;
}

export interface ReadmeStarAudit {
  score: number;
  grade: "launch-ready" | "promising" | "needs-work";
  summary: string;
  passedCount: number;
  totalCount: number;
  items: ReadmeAuditItem[];
  topFixes: ReadmeAuditItem[];
}

export interface GitHubReadmeReference {
  owner: string;
  repo: string;
  displayUrl: string;
  apiUrl: string;
}

export interface GitHubReadmeFetchResult {
  reference: GitHubReadmeReference;
  readme: string;
}

export interface GitHubRepoStats {
  description: string;
  homepage: string;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  license: string;
  hasIssues: boolean;
  archived: boolean;
}

export interface RepoProfileItem {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  evidence: string;
  fix: string;
}

export interface GitHubRepoStarProfile {
  score: number;
  grade: "growth-ready" | "promising" | "needs-foundation";
  summary: string;
  stats: GitHubRepoStats;
  items: RepoProfileItem[];
  topFixes: RepoProfileItem[];
}

interface RepoProfileRule {
  id: string;
  label: string;
  weight: number;
  test: (stats: GitHubRepoStats) => boolean;
  evidence: (stats: GitHubRepoStats) => string;
  fix: string;
}

interface AuditRule {
  id: string;
  label: string;
  weight: number;
  test: (readme: string) => boolean;
  evidence: string;
  fix: string;
}

const auditRules: AuditRule[] = [
  {
    id: "clear-hook",
    label: "Clear first-screen hook",
    weight: 16,
    test: (readme) => /^#\s+\S+/m.test(readme) && /\b(helps|turns|builds|for|without|local|open-source)\b/i.test(readme),
    evidence: "The README opens with a named project and a concrete value proposition.",
    fix: "Open with one sentence that says who it helps and what outcome they get."
  },
  {
    id: "visual-proof",
    label: "Visual proof above the fold",
    weight: 14,
    test: (readme) => /!\[[^\]]*]\([^)]+\)|<img\b/i.test(readme),
    evidence: "A screenshot, GIF, or image appears in the README.",
    fix: "Add one current screenshot or 20-40 second GIF before the feature list."
  },
  {
    id: "quick-start",
    label: "Fast quick start",
    weight: 15,
    test: (readme) =>
      /quick\s*start|getting\s*started|install/i.test(readme) &&
      /\b(pnpm|npm|yarn|bun|npx|docker)\s+(install|i|dev|start|run|up|create)\b/i.test(readme),
    evidence: "The README gives visitors copy-paste setup commands.",
    fix: "Add a Quick Start block with install and run commands that work in under 60 seconds."
  },
  {
    id: "demo-path",
    label: "Demo path",
    weight: 12,
    test: (readme) => /\b(demo|try|preview|playground|live)\b/i.test(readme) && /https?:\/\//i.test(readme),
    evidence: "Visitors can find a hosted demo, preview, or explicit demo status.",
    fix: "Link a working hosted demo or state the current demo status and local fallback."
  },
  {
    id: "useful-without-signup",
    label: "Useful without signup",
    weight: 10,
    test: (readme) => /\b(no signup|without signup|without an api key|no api key|local-first|runs locally)\b/i.test(readme),
    evidence: "The README reduces adoption friction by saying what works locally.",
    fix: "State which core workflow runs without signup, cloud setup, or a paid API key."
  },
  {
    id: "examples",
    label: "Concrete examples",
    weight: 11,
    test: (readme) => /\b(example|sample|gallery|screenshot|output|before\/after)\b/i.test(readme),
    evidence: "The README links or shows examples of real output.",
    fix: "Add one generated example, gallery link, or before/after output."
  },
  {
    id: "contribution-path",
    label: "Contributor path",
    weight: 10,
    test: (readme) => /\b(contribut|good first|starter issue|roadmap|issue)\b/i.test(readme),
    evidence: "The README tells potential contributors where to help.",
    fix: "Link starter issues, contribution notes, or a short roadmap."
  },
  {
    id: "trust-signals",
    label: "Trust signals",
    weight: 8,
    test: (readme) => /!\[[^\]]*]\([^)]*(badge|shields|actions|license)[^)]*\)|\b(MIT|Apache|BSD|GPL|license)\b/i.test(readme),
    evidence: "Badges or license information are visible.",
    fix: "Show CI/license badges or add a clear license section."
  },
  {
    id: "share-ready",
    label: "Share-ready launch copy",
    weight: 4,
    test: (readme) => /\b(Hacker News|Show HN|Product Hunt|Reddit|Twitter|X\/Twitter|launch)\b/i.test(readme),
    evidence: "The README connects the project to concrete launch channels.",
    fix: "Add one short launch note or channel-specific example visitors can share."
  }
];

const repoProfileRules: RepoProfileRule[] = [
  {
    id: "description",
    label: "Searchable description",
    weight: 16,
    test: (stats) => stats.description.length >= 30,
    evidence: (stats) => `Description is ${stats.description.length} characters.`,
    fix: "Add a specific GitHub About description that names the user and outcome."
  },
  {
    id: "homepage",
    label: "Homepage or demo link",
    weight: 14,
    test: (stats) => /^https?:\/\//i.test(stats.homepage),
    evidence: (stats) => `Homepage points to ${stats.homepage}.`,
    fix: "Add a working homepage, hosted demo, or docs URL in the repository About panel."
  },
  {
    id: "topics",
    label: "Discovery topics",
    weight: 14,
    test: (stats) => stats.topics.length >= 3,
    evidence: (stats) => `Repository has ${stats.topics.length} topics: ${stats.topics.slice(0, 5).join(", ")}.`,
    fix: "Add at least three GitHub topics that match the audience and AI workflow."
  },
  {
    id: "license",
    label: "Clear license",
    weight: 12,
    test: (stats) => stats.license.length > 0,
    evidence: (stats) => `License is ${stats.license}.`,
    fix: "Add a standard open-source license so visitors know they can use and fork the project."
  },
  {
    id: "issues",
    label: "Contributor entry points",
    weight: 10,
    test: (stats) => stats.hasIssues && stats.openIssues > 0,
    evidence: (stats) => `${stats.openIssues} open issue${stats.openIssues === 1 ? "" : "s"} are visible.`,
    fix: "Enable issues and open a few starter tasks for docs, examples, providers, or integrations."
  },
  {
    id: "forkability",
    label: "Forkability signal",
    weight: 10,
    test: (stats) => stats.forks > 0,
    evidence: (stats) => `${stats.forks} fork${stats.forks === 1 ? "" : "s"} show reuse interest.`,
    fix: "Add starter templates, example outputs, or contribution tasks that make forking obvious."
  },
  {
    id: "traction",
    label: "Initial traction",
    weight: 12,
    test: (stats) => stats.stars > 0,
    evidence: (stats) => `${stats.stars} star${stats.stars === 1 ? "" : "s"} are visible.`,
    fix: "Share the repository with a small trusted audience to get the first stars and feedback."
  },
  {
    id: "active",
    label: "Active repository",
    weight: 12,
    test: (stats) => !stats.archived,
    evidence: () => "Repository is not archived.",
    fix: "Unarchive the repository before asking visitors to try, star, or contribute."
  }
];

export function parseGitHubRepoUrl(input: string): GitHubReadmeReference | null {
  const trimmed = input.trim();
  const shorthand = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shorthand) {
    return buildGitHubReadmeReference(shorthand[1], shorthand[2]);
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.hostname !== "github.com") {
    return null;
  }

  const [owner, repo] = url.pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!owner || !repo) {
    return null;
  }

  return buildGitHubReadmeReference(owner, repo.replace(/\.git$/i, ""));
}

export async function fetchGitHubReadme(
  repoUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<GitHubReadmeFetchResult> {
  const reference = parseGitHubRepoUrl(repoUrl);
  if (!reference) {
    throw new Error("Paste a GitHub repository URL like https://github.com/owner/repo or owner/repo.");
  }

  const response = await fetchImpl(reference.apiUrl, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch README for ${reference.owner}/${reference.repo}: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const readme = decodeGitHubReadmePayload(payload);
  if (!readme) {
    throw new Error(`GitHub did not return a readable README for ${reference.owner}/${reference.repo}.`);
  }

  return {
    reference,
    readme
  };
}

export async function fetchGitHubRepoProfile(
  repoUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<GitHubRepoStarProfile> {
  const reference = parseGitHubRepoUrl(repoUrl);
  if (!reference) {
    throw new Error("Paste a GitHub repository URL like https://github.com/owner/repo or owner/repo.");
  }

  const response = await fetchImpl(`https://api.github.com/repos/${reference.owner}/${reference.repo}`, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch repository profile for ${reference.owner}/${reference.repo}: ${response.status}`);
  }

  return buildGitHubRepoStarProfile(readGitHubRepoStats(await response.json()));
}

export function auditReadmeForStars(readme: string): ReadmeStarAudit {
  const normalized = readme.trim();
  const items = auditRules.map((rule) => {
    const passed = normalized.length > 0 && rule.test(normalized);
    return {
      id: rule.id,
      label: rule.label,
      passed,
      weight: rule.weight,
      evidence: passed ? rule.evidence : "Missing or too hard to find in the first README pass.",
      fix: rule.fix
    };
  });

  const totalWeight = items.reduce((total, item) => total + item.weight, 0);
  const earnedWeight = items.reduce((total, item) => total + (item.passed ? item.weight : 0), 0);
  const score = normalized.length === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);
  const grade = gradeForScore(score);
  const passedCount = items.filter((item) => item.passed).length;
  const topFixes = items
    .filter((item) => !item.passed)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  return {
    score,
    grade,
    summary: summaryForScore(score, topFixes),
    passedCount,
    totalCount: items.length,
    items,
    topFixes
  };
}

export function buildGitHubRepoStarProfile(stats: GitHubRepoStats): GitHubRepoStarProfile {
  const items = repoProfileRules.map((rule) => {
    const passed = rule.test(stats);
    return {
      id: rule.id,
      label: rule.label,
      passed,
      weight: rule.weight,
      evidence: passed ? rule.evidence(stats) : "Missing or too weak for a first-pass GitHub visitor.",
      fix: rule.fix
    };
  });
  const totalWeight = items.reduce((total, item) => total + item.weight, 0);
  const earnedWeight = items.reduce((total, item) => total + (item.passed ? item.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);
  const topFixes = items
    .filter((item) => !item.passed)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  return {
    score,
    grade: repoProfileGradeForScore(score),
    summary: repoProfileSummary(score, topFixes),
    stats,
    items,
    topFixes
  };
}

export function formatReadmeStarAudit(audit: ReadmeStarAudit): string {
  const statusRows = audit.items
    .map((item) => `- ${item.passed ? "[x]" : "[ ]"} ${item.label}: ${item.passed ? item.evidence : item.fix}`)
    .join("\n");
  const topFixes =
    audit.topFixes.length > 0
      ? audit.topFixes.map((item, index) => `${index + 1}. ${item.fix}`).join("\n")
      : "No critical gaps found. Keep examples and screenshots current as the product changes.";

  return `# README Star Audit

Score: ${audit.score}/100
Grade: ${audit.grade}

${audit.summary}

## Top Fixes

${topFixes}

## Checklist

${statusRows}
`;
}

export function formatGitHubRepoStarProfile(profile: GitHubRepoStarProfile): string {
  const statusRows = profile.items
    .map((item) => `- ${item.passed ? "[x]" : "[ ]"} ${item.label}: ${item.passed ? item.evidence : item.fix}`)
    .join("\n");
  const topFixes =
    profile.topFixes.length > 0
      ? profile.topFixes.map((item, index) => `${index + 1}. ${item.fix}`).join("\n")
      : "No critical repository profile gaps found. Keep the demo URL, topics, and starter issues current.";

  return `# GitHub Star Profile

Score: ${profile.score}/100
Grade: ${profile.grade}

${profile.summary}

## Repository Snapshot

- Stars: ${profile.stats.stars}
- Forks: ${profile.stats.forks}
- Open issues: ${profile.stats.openIssues}
- Topics: ${profile.stats.topics.length > 0 ? profile.stats.topics.join(", ") : "none"}
- License: ${profile.stats.license || "none"}
- Homepage: ${profile.stats.homepage || "none"}

## Top Fixes

${topFixes}

## Checklist

${statusRows}
`;
}

function gradeForScore(score: number): ReadmeStarAudit["grade"] {
  if (score >= 82) {
    return "launch-ready";
  }
  if (score >= 58) {
    return "promising";
  }
  return "needs-work";
}

function summaryForScore(score: number, topFixes: ReadmeAuditItem[]): string {
  if (score === 0) {
    return "Paste a README to score its GitHub star-readiness.";
  }
  if (topFixes.length === 0) {
    return "This README already gives visitors a clear reason to try, trust, and share the project.";
  }
  return `The README has a usable foundation. The fastest lift is: ${topFixes.map((item) => item.label).join(", ")}.`;
}

function repoProfileGradeForScore(score: number): GitHubRepoStarProfile["grade"] {
  if (score >= 82) {
    return "growth-ready";
  }
  if (score >= 58) {
    return "promising";
  }
  return "needs-foundation";
}

function repoProfileSummary(score: number, topFixes: RepoProfileItem[]): string {
  if (topFixes.length === 0) {
    return "The repository profile has the public metadata, trust, and contributor signals needed for a stronger launch.";
  }
  if (score < 40) {
    return `The repository profile needs foundation work before a serious star push. Start with: ${topFixes
      .map((item) => item.label)
      .join(", ")}.`;
  }
  return `The repository profile has some launch signal. The fastest public lift is: ${topFixes
    .map((item) => item.label)
    .join(", ")}.`;
}

function buildGitHubReadmeReference(owner: string, repo: string): GitHubReadmeReference {
  return {
    owner,
    repo,
    displayUrl: `https://github.com/${owner}/${repo}`,
    apiUrl: `https://api.github.com/repos/${owner}/${repo}/readme`
  };
}

function decodeGitHubReadmePayload(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  const content = typeof record.content === "string" ? record.content : "";
  const encoding = typeof record.encoding === "string" ? record.encoding.toLowerCase() : "";

  if (!content || encoding !== "base64") {
    return "";
  }

  return decodeBase64Utf8(content.replace(/\s+/g, ""));
}

function readGitHubRepoStats(payload: unknown): GitHubRepoStats {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const license = record.license && typeof record.license === "object" ? (record.license as Record<string, unknown>) : {};

  return {
    description: readText(record.description),
    homepage: readText(record.homepage),
    topics: Array.isArray(record.topics) ? record.topics.filter((topic): topic is string => typeof topic === "string") : [],
    stars: readNumber(record.stargazers_count),
    forks: readNumber(record.forks_count),
    openIssues: readNumber(record.open_issues_count),
    license: readText(license.spdx_id) || readText(license.name),
    hasIssues: record.has_issues === true,
    archived: record.archived === true
  };
}

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function decodeBase64Utf8(value: string): string {
  try {
    return decodeURIComponent(
      Array.from(atob(value), (character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    );
  } catch {
    return "";
  }
}
