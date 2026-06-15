import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const defaultTimeoutMs = 10000;
const defaultExpectedText = "OpenTop - AI Opportunity Radar";

export function extractAssetUrls(html, pageUrl) {
  const assets = [];
  const pattern = /<(script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/gi;

  for (const match of html.matchAll(pattern)) {
    const rawUrl = match[2];
    if (rawUrl.startsWith("data:") || rawUrl.startsWith("mailto:") || rawUrl.startsWith("#")) {
      continue;
    }

    assets.push(new URL(rawUrl, pageUrl).toString());
  }

  return [...new Set(assets)];
}

export function resolveSmokeOptions(argv, env = process.env, packageJsonText = readPackageJson()) {
  const packageJson = JSON.parse(packageJsonText);
  const args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item.startsWith("--") && argv[index + 1] && !argv[index + 1].startsWith("--")) {
      args.set(item, argv[index + 1]);
      index += 1;
    } else if (item.startsWith("--")) {
      args.set(item, "true");
    }
  }

  return {
    expectedText: args.get("--expect") ?? env.OPENTOP_SMOKE_EXPECT ?? defaultExpectedText,
    timeoutMs: Number(args.get("--timeout-ms") ?? env.OPENTOP_SMOKE_TIMEOUT_MS ?? defaultTimeoutMs),
    url: args.get("--url") ?? env.OPENTOP_PAGES_URL ?? packageJson.homepage
  };
}

export async function runSmokeCheck(options) {
  const targetUrl = new URL(options.url).toString();
  const page = await fetchText(targetUrl, options.timeoutMs);
  const checks = [
    ["page returns HTTP 200", page.status === 200, `${page.status} ${page.statusText}`],
    ["page includes expected OpenTop marker", page.body.includes(options.expectedText), options.expectedText]
  ];

  const assetUrls = extractAssetUrls(page.body, page.finalUrl);

  for (const assetUrl of assetUrls) {
    const asset = await fetchHeadOrGet(assetUrl, options.timeoutMs);
    checks.push([`asset loads: ${assetUrl}`, asset.status === 200, `${asset.status} ${asset.statusText}`]);
  }

  return {
    checks,
    finalUrl: page.finalUrl,
    targetUrl
  };
}

function readPackageJson() {
  return readFileSync(new URL("../package.json", import.meta.url), "utf8");
}

async function fetchText(url, timeoutMs) {
  const response = await fetchWithTimeout(url, timeoutMs, { method: "GET" });
  return {
    body: await response.text(),
    finalUrl: response.url,
    status: response.status,
    statusText: response.statusText
  };
}

async function fetchHeadOrGet(url, timeoutMs) {
  const head = await fetchWithTimeout(url, timeoutMs, { method: "HEAD" });
  if (head.status !== 405) {
    return head;
  }

  return fetchWithTimeout(url, timeoutMs, { method: "GET" });
}

async function fetchWithTimeout(url, timeoutMs, init) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "opentop-pages-smoke-check",
        ...init.headers
      },
      redirect: "follow",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function printHelp() {
  console.log(`Usage: pnpm smoke:pages [--url https://example.com/opentop/] [--expect "OpenTop - AI Opportunity Radar"]

Options:
  --url         Pages URL to check. Defaults to package.json homepage or OPENTOP_PAGES_URL.
  --expect      Text that must be present in the HTML response.
  --timeout-ms  Per-request timeout in milliseconds. Defaults to ${defaultTimeoutMs}.
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  const result = await runSmokeCheck(resolveSmokeOptions(process.argv.slice(2)));

  console.log(`Target: ${result.targetUrl}`);
  console.log(`Final URL: ${result.finalUrl}`);

  for (const [label, ok, detail] of result.checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`);
  }

  if (result.checks.some(([, ok]) => !ok)) {
    console.error("\nDiagnosis:");
    console.error("- Confirm the repository exists and Pages source is set to GitHub Actions.");
    console.error("- Confirm the Deploy Pages workflow finished successfully on main.");
    console.error("- If asset checks fail, keep Vite base as './' so built JS/CSS paths are relative.");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
