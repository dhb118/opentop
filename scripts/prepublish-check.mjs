import { execFileSync } from "node:child_process";

const repo = "dhb118/opentop";
const expectedRemote = `https://github.com/${repo}.git`;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

async function main() {
  const checks = [];
  const branch = git(["branch", "--show-current"]);
  const remote = git(["remote", "get-url", "origin"]);
  const status = git(["status", "--short"]);
  const head = git(["rev-parse", "--short", "HEAD"]);

  checks.push(["branch is main", branch === "main", branch]);
  checks.push(["origin remote is configured", remote === expectedRemote, remote]);
  checks.push(["working tree is clean", status.length === 0, status || "clean"]);
  checks.push(["HEAD commit exists", head.length > 0, head]);

  const github = await checkGitHubRepo();
  checks.push(["GitHub repository is reachable", github.ok, github.detail]);

  for (const [label, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`);
  }

  if (checks.some(([, ok]) => !ok)) {
    process.exitCode = 1;
  }
}

async function checkGitHubRepo() {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
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
    return { ok: false, detail: error instanceof Error ? error.message : "request failed" };
  }
}

await main();
