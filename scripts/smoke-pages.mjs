import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const defaultTimeoutMs = 10000;
const defaultExpectedText = "OpenTop - AI Opportunity Radar";
const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

export function isHtmlContentType(value) {
  return typeof value === "string" && value.toLowerCase().includes("text/html");
}

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
    url: args.get("--url") ?? env.OPENTOP_PAGES_URL ?? packageJson.homepage,
    userAgent: args.get("--user-agent") ?? env.OPENTOP_SMOKE_USER_AGENT ?? defaultUserAgent
  };
}

export async function runSmokeCheck(options) {
  const targetUrl = new URL(options.url).toString();
  const userAgent = options.userAgent ?? defaultUserAgent;
  let page;
  try {
    page = await fetchText(targetUrl, options.timeoutMs, userAgent);
  } catch (error) {
    return {
      checks: [["page fetch completes", false, formatError(error)]],
      finalUrl: targetUrl,
      targetUrl
    };
  }

  const checks = [
    ["page returns HTTP 200", page.status === 200, `${page.status} ${page.statusText}`],
    ["page is served as HTML", isHtmlContentType(page.contentType), page.contentType || "missing content-type"],
    ["page includes expected OpenTop marker", page.body.includes(options.expectedText), options.expectedText]
  ];

  const assetUrls = extractAssetUrls(page.body, page.finalUrl);

  for (const assetUrl of assetUrls) {
    try {
      const asset = await fetchHeadOrGet(assetUrl, options.timeoutMs, userAgent);
      checks.push([`asset loads: ${assetUrl}`, asset.status === 200, `${asset.status} ${asset.statusText}`]);
    } catch (error) {
      checks.push([`asset loads: ${assetUrl}`, false, formatError(error)]);
    }
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

async function fetchText(url, timeoutMs, userAgent) {
  const response = await fetchWithTimeout(url, timeoutMs, { method: "GET" }, userAgent);
  return {
    body: await response.text(),
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url,
    status: response.status,
    statusText: response.statusText
  };
}

async function fetchHeadOrGet(url, timeoutMs, userAgent) {
  const head = await fetchWithTimeout(url, timeoutMs, { method: "HEAD" }, userAgent);
  if (head.status >= 200 && head.status < 400) {
    return head;
  }

  return fetchWithTimeout(url, timeoutMs, { method: "GET" }, userAgent);
}

async function fetchWithTimeout(url, timeoutMs, init, userAgent) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...init,
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent": userAgent,
          ...init.headers
        },
        redirect: "follow",
        signal: controller.signal
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await sleep(250 * attempt);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

function printHelp() {
  console.log(`Usage: pnpm smoke:pages [--url https://example.com/opentop/] [--expect "OpenTop - AI Opportunity Radar"]

Options:
  --url         Pages URL to check. Defaults to package.json homepage or OPENTOP_PAGES_URL.
  --expect      Text that must be present in the HTML response.
  --timeout-ms  Per-request timeout in milliseconds. Defaults to ${defaultTimeoutMs}.
  --user-agent  User-Agent for page and asset requests. Defaults to a browser-like UA.
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
    console.error("- Confirm the entry HTML is served with text/html, not text/plain.");
    console.error("- If a fallback CDN blocks assets, retry with a browser-like User-Agent.");
    console.error("- If asset checks fail, keep Vite base as './' so built JS/CSS paths are relative.");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
