import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import net from "node:net";

const defaultOutDir = "docs/assets/opentop-demo-frames";
const defaultSample = "readme-positioning-assistant";
const defaultSize = { width: 1440, height: 1100 };

export function parseCaptureArgs(argv) {
  const options = {
    chromePath: process.env.CHROME_PATH || "",
    height: defaultSize.height,
    outDir: defaultOutDir,
    sample: defaultSample,
    url: "",
    width: defaultSize.width
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--chrome") {
      options.chromePath = argv[(index += 1)] || "";
    } else if (arg === "--height") {
      options.height = readPositiveInteger(argv[(index += 1)], "--height");
    } else if (arg === "--out") {
      options.outDir = argv[(index += 1)] || defaultOutDir;
    } else if (arg === "--sample") {
      options.sample = argv[(index += 1)] || defaultSample;
    } else if (arg === "--url") {
      options.url = argv[(index += 1)] || "";
    } else if (arg === "--width") {
      options.width = readPositiveInteger(argv[(index += 1)], "--width");
    } else if (arg === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

export function demoFramePlan() {
  return [
    {
      filename: "01-load-built-in-brief.png",
      label: "Load a built-in AI builder brief"
    },
    {
      filename: "02-compare-score-explanation.png",
      label: "Compare score explanation"
    },
    {
      filename: "03-copy-demo-script.png",
      label: "Copy demo script export"
    }
  ];
}

async function captureDemoFrames(options = parseCaptureArgs(process.argv.slice(2))) {
  if (options.help) {
    printHelp();
    return;
  }

  const chromePath = options.chromePath || findChromePath();
  const url = options.url || pathToFileURL(resolve("dist/index.html")).href;
  const outDir = resolve(options.outDir);
  const port = await findFreePort();
  const userDataDir = await mkdtemp(join(tmpdir(), "opentop-chrome-"));
  const browser = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--allow-file-access-from-files",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    `--window-size=${options.width},${options.height}`,
    url
  ]);

  try {
    const pageTarget = await waitForPageTarget(port);
    const client = await connectToPage(pageTarget.webSocketDebuggerUrl);

    try {
      await client.send("Page.enable");
      await client.send("Runtime.enable");
      await client.send("Emulation.setDeviceMetricsOverride", {
        deviceScaleFactor: 1,
        height: options.height,
        mobile: false,
        width: options.width
      });
      await waitForSelector(client, "[data-sample]");
      await mkdir(outDir, { recursive: true });

      await evaluate(client, "window.scrollTo(0, 0)");
      await captureFrame(client, join(outDir, "01-load-built-in-brief.png"));

      await evaluate(
        client,
        `
          const sample = document.querySelector('[data-sample="${cssEscape(options.sample)}"]');
          if (!sample) throw new Error('Sample brief not found: ${jsString(options.sample)}');
          sample.click();
        `
      );
      await waitForSelector(client, ".detail-panel");
      await evaluate(client, "document.querySelector('.score-math')?.scrollIntoView({ block: 'center' })");
      await wait(250);
      await captureFrame(client, join(outDir, "02-compare-score-explanation.png"));

      await evaluate(
        client,
        `
          Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: async (text) => { window.__opentopDemoCopied = text; } }
          });
          const button = document.querySelector('[data-copy="demo-script"]');
          if (!button) throw new Error('Copy Demo Script button not found');
          button.scrollIntoView({ block: 'center' });
          button.click();
        `
      );
      await wait(150);
      await captureFrame(client, join(outDir, "03-copy-demo-script.png"));

      for (const frame of demoFramePlan()) {
        console.log(`Captured ${frame.filename}: ${frame.label}`);
      }
    } finally {
      client.close();
    }
  } finally {
    await closeBrowser(browser);
    await cleanupUserDataDir(userDataDir);
  }
}

async function closeBrowser(browser) {
  if (browser.exitCode !== null || browser.signalCode !== null) {
    return;
  }

  browser.kill();
  await Promise.race([
    new Promise((resolveExit) => browser.once("exit", resolveExit)),
    wait(2_000)
  ]);
}

async function cleanupUserDataDir(userDataDir) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await rm(userDataDir, { force: true, recursive: true });
      return;
    } catch (error) {
      if (attempt === 2) {
        console.warn(`WARN could not remove temporary Chrome profile: ${error.message}`);
        return;
      }
      await wait(500);
    }
  }
}

async function captureFrame(client, path) {
  const result = await client.send("Page.captureScreenshot", {
    captureBeyondViewport: false,
    format: "png"
  });
  await writeFile(path, Buffer.from(result.data, "base64"));
}

async function connectToPage(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 1;

  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) {
      return;
    }

    const { reject, resolveResult } = pending.get(message.id);
    pending.delete(message.id);

    if (message.error) {
      reject(new Error(message.error.message || "Chrome DevTools command failed"));
      return;
    }

    resolveResult(message.result || {});
  });

  return {
    close() {
      socket.close();
    },
    send(method, params = {}) {
      if (socket.readyState !== WebSocket.OPEN) {
        throw new Error("Chrome DevTools websocket is not open");
      }

      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolveResult, reject) => {
        pending.set(id, { reject, resolveResult });
      });
    }
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    awaitPromise: true,
    expression
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }

  return result.result;
}

async function waitForSelector(client, selector) {
  const escaped = jsString(selector);
  await waitFor(async () => {
    const result = await evaluate(client, `Boolean(document.querySelector('${escaped}'))`);
    return result.value === true;
  }, `selector ${selector}`);
}

async function waitForPageTarget(port) {
  return waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json`);
    const targets = await response.json();
    return targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  }, "Chrome page target");
}

async function waitFor(callback, label, timeoutMs = 10_000) {
  const start = Date.now();
  let lastError;

  while (Date.now() - start < timeoutMs) {
    try {
      const result = await callback();
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
    await wait(100);
  }

  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`);
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function findFreePort() {
  const server = net.createServer();
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 9222;
  await new Promise((resolveClose) => server.close(resolveClose));
  return port;
}

function findChromePath() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "google-chrome",
    "chromium",
    "chromium-browser",
    "msedge"
  ];

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error("Chrome or Edge was not found. Set CHROME_PATH or pass --chrome.");
}

function cssEscape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function jsString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function readPositiveInteger(value, flag) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${flag} must be a positive integer`);
  }
  return number;
}

function printHelp() {
  console.log(`Usage: pnpm capture:demo-frames [--url URL] [--out DIR] [--sample SAMPLE_ID] [--chrome PATH]

Captures three OpenTop demo frames from a built app. Run pnpm build first.
Set CHROME_PATH if Chrome or Edge is not on a standard path.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await captureDemoFrames();
}
