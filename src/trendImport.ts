export interface TrendSignalImport {
  signal: string;
  channels: string;
  rowCount: number;
  ignoredCount: number;
  format: "csv" | "notes" | "github-issues";
  failures?: string[];
}

interface TrendItem {
  source: string;
  signal: string;
}

export interface GitHubIssueReference {
  owner: string;
  repo: string;
  number: number;
  url: string;
}

interface GitHubIssueApiResponse {
  title?: string;
  body?: string | null;
  html_url?: string;
  state?: string;
  labels?: Array<string | { name?: string }>;
  pull_request?: unknown;
}

interface MinimalFetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}

type FetchLike = (url: string, init?: RequestInit) => Promise<MinimalFetchResponse>;

const githubIssueUrlPattern =
  /https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/issues\/(\d+)(?:[/?#][^\s<)]*)?/gi;

export function parseTrendSignals(input: string): TrendSignalImport | null {
  return looksLikeCsv(input) ? parseTrendCsv(input) : parseTrendNotes(input);
}

export function parseGitHubIssueUrls(input: string): GitHubIssueReference[] {
  const seen = new Set<string>();
  const references: GitHubIssueReference[] = [];

  for (const match of input.matchAll(githubIssueUrlPattern)) {
    const owner = match[1];
    const repo = match[2];
    const number = Number(match[3]);
    const key = `${owner.toLowerCase()}/${repo.toLowerCase()}#${number}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    references.push({
      owner,
      repo,
      number,
      url: `https://github.com/${owner}/${repo}/issues/${number}`
    });
  }

  return references;
}

export async function fetchGitHubIssueSignals(
  input: string,
  fetcher: FetchLike = globalThis.fetch
): Promise<TrendSignalImport | null> {
  const references = parseGitHubIssueUrls(input).slice(0, 12);

  if (references.length === 0) {
    return null;
  }
  if (!fetcher) {
    throw new Error("This browser cannot fetch GitHub issues.");
  }

  const results = await Promise.all(references.map((reference) => fetchGitHubIssue(reference, fetcher)));
  const items = results.flatMap((result) => (result.item ? [result.item] : []));
  const failures = results.flatMap((result) => (result.failure ? [result.failure] : []));

  if (items.length === 0) {
    throw new Error(`Could not import GitHub issues: ${failures.join("; ")}`);
  }

  return {
    ...buildImport(items),
    ignoredCount: references.length - items.length,
    format: "github-issues",
    failures
  };
}

export function parseTrendCsv(csv: string): TrendSignalImport | null {
  const rows = parseCsvRows(csv)
    .map((row) => row.map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length > 0);

  if (rows.length === 0) {
    return null;
  }

  const header = rows[0].map((cell) => cell.toLowerCase());
  const hasHeader = header.some((cell) => ["source", "channel", "signal", "note", "trend", "url"].includes(cell));
  const body = hasHeader ? rows.slice(1) : rows;
  const sourceIndex = findIndex(header, ["source", "channel", "platform"]);
  const signalIndex = findIndex(header, ["signal", "note", "trend", "summary"]);

  const parsed = body.map((row) => {
    const source = cleanCell(row[hasHeader && sourceIndex >= 0 ? sourceIndex : 0]);
    const signal = cleanCell(row[hasHeader && signalIndex >= 0 ? signalIndex : row.length > 1 ? 1 : 0]);
    return signal ? { source, signal } : null;
  });
  const items = parsed.filter((item): item is TrendItem => Boolean(item)).slice(0, 12);

  if (items.length === 0) {
    return null;
  }

  return {
    ...buildImport(items),
    ignoredCount: parsed.length - items.length,
    format: "csv"
  };
}

export function parseTrendNotes(notes: string): TrendSignalImport | null {
  const parsed = notes
    .split(/\r?\n/)
    .map(cleanNoteLine)
    .filter((line) => line.length > 0)
    .map(parseNoteLine);
  const items = parsed.filter((item): item is TrendItem => Boolean(item)).slice(0, 12);

  if (items.length === 0) {
    return null;
  }

  return {
    ...buildImport(items),
    ignoredCount: parsed.length - items.length,
    format: "notes"
  };
}

function buildImport(items: TrendItem[]): Pick<TrendSignalImport, "signal" | "channels" | "rowCount"> {
  const channels = Array.from(new Set(items.map((item) => item.source).filter(Boolean))).join(", ");
  const signal = items.map((item) => `${item.source ? `${item.source}: ` : ""}${item.signal}`).join("\n");

  return {
    channels,
    rowCount: items.length,
    signal
  };
}

async function fetchGitHubIssue(
  reference: GitHubIssueReference,
  fetcher: FetchLike
): Promise<{ item: TrendItem | null; failure: string | null }> {
  const label = `${reference.owner}/${reference.repo}#${reference.number}`;

  try {
    const response = await fetcher(
      `https://api.github.com/repos/${reference.owner}/${reference.repo}/issues/${reference.number}`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );

    if (!response.ok) {
      return { item: null, failure: `${label}: ${response.status} ${response.statusText || "request failed"}` };
    }

    const issue = (await response.json()) as GitHubIssueApiResponse;
    if (issue.pull_request) {
      return { item: null, failure: `${label}: pull requests are skipped` };
    }

    const title = cleanCell(issue.title);
    if (!title) {
      return { item: null, failure: `${label}: missing issue title` };
    }

    const state = cleanCell(issue.state);
    const labels = formatIssueLabels(issue.labels);
    const summary = summarizeIssueBody(issue.body);
    const url = issue.html_url?.startsWith("https://github.com/") ? issue.html_url : reference.url;
    const parts = [title, summary, labels ? `labels: ${labels}` : "", state ? `state: ${state}` : "", url].filter(
      Boolean
    );

    return {
      item: {
        source: `GitHub ${label}`,
        signal: parts.join(" | ")
      },
      failure: null
    };
  } catch (error) {
    return { item: null, failure: `${label}: ${error instanceof Error ? error.message : "request failed"}` };
  }
}

function formatIssueLabels(labels: GitHubIssueApiResponse["labels"]): string {
  return (labels ?? [])
    .map((label) => (typeof label === "string" ? label : label.name ?? ""))
    .map(cleanCell)
    .filter(Boolean)
    .slice(0, 5)
    .join(", ");
}

function summarizeIssueBody(body: string | null | undefined): string {
  return cleanCell(
    (body ?? "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}[-*+]\s+/gm, "")
      .replace(/\s+/g, " ")
  );
}

function looksLikeCsv(input: string): boolean {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return false;
  }

  const first = lines[0].toLowerCase();
  return first.includes(",") && (first.includes("source") || first.includes("signal") || first.includes("channel"));
}

function cleanNoteLine(line: string): string {
  return line
    .replace(/^\s{0,3}[-*+]\s+/, "")
    .replace(/^\s{0,3}\d+[.)]\s+/, "")
    .replace(/^>\s?/, "")
    .trim();
}

function parseNoteLine(line: string): TrendItem | null {
  const withoutLinks = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 $2");
  const match = withoutLinks.match(/^([^:|-]{2,32})\s*[:|-]\s*(.+)$/);
  const source = cleanCell(match?.[1]);
  const signal = cleanCell(match?.[2] ?? withoutLinks);

  if (signal.length < 12) {
    return null;
  }

  return { source, signal };
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function findIndex(header: string[], candidates: string[]): number {
  return header.findIndex((cell) => candidates.includes(cell));
}

function cleanCell(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 360);
}
