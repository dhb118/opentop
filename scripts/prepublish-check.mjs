import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const repo = "dhb118/opentop";
const expectedRemote = `https://github.com/${repo}.git`;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

export async function runPrepublishCheck({ fetchImpl = fetch } = {}) {
  const checks = [];
  const branch = git(["branch", "--show-current"]);
  const remote = git(["remote", "get-url", "origin"]);
  const status = git(["status", "--short"]);
  const head = git(["rev-parse", "--short", "HEAD"]);

  checks.push(["branch is main", branch === "main", branch]);
  checks.push(["origin remote is configured", remote === expectedRemote, remote]);
  checks.push(["working tree is clean", status.length === 0, status || "clean"]);
  checks.push(["HEAD commit exists", head.length > 0, head]);

  const github = await checkGitHubRepo({ fetchImpl });
  checks.push(["GitHub repository is reachable", github.ok, github.detail]);

  return checks;
}

async function main() {
  const checks = await runPrepublishCheck();

  for (const [label, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`);
  }

  if (checks.some(([, ok]) => !ok)) {
    process.exitCode = 1;
  }
}

export async function checkGitHubRepo({ fetchImpl = fetch } = {}) {
  try {
    const response = await fetchImpl(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "opentop-prepublish-check"
      }
    });

    if (!response.ok) {
      return { ok: false, detail: `${response.status} ${response.statusText}` };
    }

    const data = await response.json();
    return { ok: true, detail: `${data.full_name}, ${data.stargazers_count} stars` };
  } catch (error) {
    return { ok: false, detail: formatError(error) };
  }
}

export function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const details = [error.message || "request failed"];
  const cause = error.cause;

  if (cause && typeof cause === "object") {
    const code = "code" in cause ? String(cause.code) : "";
    const message = "message" in cause ? String(cause.message) : "";
    const causeDetail = [code, message].filter(Boolean).join(" ");

    if (causeDetail && !details.includes(causeDetail)) {
      details.push(causeDetail);
    }
  }

  return details.join(" - ");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
