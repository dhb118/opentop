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

function decodeBase64Utf8(value: string): string {
  try {
    return decodeURIComponent(
      Array.from(atob(value), (character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    );
  } catch {
    return "";
  }
}
