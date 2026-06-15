import { readFile, readdir } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "..");
const requiredExportButtons = [
  "Copy Launch Brief",
  "Copy Launch Kit",
  "Copy Product Hunt",
  "Copy Demo Script",
  "Copy Newsletter",
  "Copy Star Plan",
  "Download Repo ZIP"
];
const defaultDistDir = "dist";

export async function runLaunchExportSmoke(options = {}) {
  const distDir = resolveWorkspacePath(options.distDir ?? defaultDistDir);
  const appRoot = new FakeElement("div", { id: "app" });
  const document = new FakeDocument(appRoot);
  const storage = createStorage();
  const importedModuleUrl = await findBuiltAppModule(distDir);
  const previousGlobals = installBrowserHarness({
    appRoot,
    distDir,
    document,
    href: options.url ?? "https://example.com/opentop/",
    storage
  });

  try {
    await import(importedModuleUrl);
    await waitFor(
      () =>
        requiredExportButtons.every((label) => appRoot.innerHTML.includes(label)) &&
        (appRoot.innerHTML.includes("Patterns from public AI repos") ||
          appRoot.innerHTML.includes("Benchmark lessons unavailable")),
      {
        timeoutMs: options.timeoutMs ?? 10000
      }
    );

    return {
      appHtml: appRoot.innerHTML,
      checks: requiredExportButtons.map((label) => ({
        label,
        ok: appRoot.innerHTML.includes(label)
      })),
      module: importedModuleUrl
    };
  } finally {
    restoreGlobals(previousGlobals);
  }
}

export async function findBuiltAppModule(distDir) {
  const absoluteDist = resolveWorkspacePath(distDir);
  const assetsDir = join(absoluteDist, "assets");
  const entries = await readdir(assetsDir, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => join(assetsDir, entry.name))
    .sort();

  if (candidates.length === 0) {
    throw new Error("Missing built JavaScript asset. Run pnpm build before pnpm smoke:launch-exports.");
  }

  return pathToFileURL(candidates[0]).href;
}

function installBrowserHarness({ appRoot, distDir, document, href, storage }) {
  const previous = new Map();
  const location = new URL(href);
  const window = {
    location,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis)
  };

  const replacements = {
    CSS: { escape: (value) => String(value).replace(/"/g, '\\"') },
    MutationObserver: class {
      disconnect() {
        // No-op for the static smoke harness.
      }

      observe() {
        // No-op for the static smoke harness.
      }
    },
    document,
    fetch: async (url) => fetchFromDist(url, distDir),
    localStorage: storage,
    navigator: { clipboard: { writeText: async () => undefined } },
    window
  };

  window.document = document;
  window.localStorage = storage;
  window.navigator = replacements.navigator;

  for (const [key, value] of Object.entries(replacements)) {
    previous.set(key, Object.prototype.hasOwnProperty.call(globalThis, key) ? globalThis[key] : undefined);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value,
      writable: true
    });
  }

  previous.set("__opentopAppRoot", appRoot);
  return previous;
}

function restoreGlobals(previous) {
  for (const [key, value] of previous.entries()) {
    if (key === "__opentopAppRoot") {
      continue;
    }
    if (value === undefined) {
      delete globalThis[key];
      continue;
    }
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value,
      writable: true
    });
  }
}

async function fetchFromDist(url, distDir) {
  const target = new URL(String(url));
  const pathname = target.pathname.split("/").filter(Boolean).at(-1) ?? "index.html";
  const filePath = join(distDir, pathname);

  try {
    const body = await readFile(filePath, "utf8");
    return {
      json: async () => JSON.parse(body),
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => body,
      url: target.toString()
    };
  } catch {
    return {
      json: async () => {
        throw new Error(`Missing static asset: ${pathname}`);
      },
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "",
      url: target.toString()
    };
  }
}

function createStorage() {
  const values = new Map();
  return {
    clear: () => values.clear(),
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value))
  };
}

class FakeDocument {
  constructor(appRoot) {
    this.appRoot = appRoot;
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  querySelector(selector) {
    if (selector === "#app") {
      return this.appRoot;
    }

    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    return this.appRoot.querySelectorAll(selector);
  }
}

class FakeElement {
  constructor(tagName, attributes = {}) {
    this.attributes = { ...attributes };
    this.children = [];
    this.dataset = datasetFromAttributes(attributes);
    this.disabled = false;
    this.download = "";
    this.href = "";
    this.listeners = new Map();
    this.style = {};
    this.tagName = tagName.toUpperCase();
    this.textContent = "";
    this.value = attributes.value ?? "";
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  click() {
    this.dispatchEvent("click");
  }

  dispatchEvent(type) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ currentTarget: this, preventDefault: () => undefined, target: this, type });
    }
  }

  focus() {
    // The smoke harness only needs focus calls not to throw.
  }

  getContext() {
    return createCanvasContext();
  }

  querySelectorAll(selector) {
    return parseElements(this.innerHTML).filter((element) => matchesSelector(element, selector));
  }
}

function parseElements(html = "") {
  const elements = [];
  const pattern = /<([a-zA-Z0-9-]+)\b([^>]*)>/g;

  for (const match of html.matchAll(pattern)) {
    if (match[0].startsWith("</")) {
      continue;
    }

    const tagName = match[1];
    const rawAttributes = match[2] ?? "";
    const attributes = parseAttributes(rawAttributes);
    const element = new FakeElement(tagName, attributes);
    elements.push(element);
  }

  return elements;
}

function parseAttributes(rawAttributes) {
  const attributes = {};
  const pattern = /([:\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (const match of rawAttributes.matchAll(pattern)) {
    attributes[match[1]] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  return attributes;
}

function datasetFromAttributes(attributes) {
  const dataset = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (!key.startsWith("data-")) {
      continue;
    }

    const datasetKey = key
      .slice(5)
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    dataset[datasetKey] = value;
  }

  return dataset;
}

function matchesSelector(element, selector) {
  if (selector === "#radarCanvas") {
    return element.attributes.id === "radarCanvas";
  }
  if (selector.startsWith("#")) {
    return element.attributes.id === selector.slice(1);
  }
  if (selector.includes("[name='provider']")) {
    return element.attributes.name === "provider";
  }

  const dataMatch = selector.match(/^\[data-([a-z-]+)\]$/);
  if (dataMatch) {
    return Object.prototype.hasOwnProperty.call(element.attributes, `data-${dataMatch[1]}`);
  }

  const nameMatch = selector.match(/^\[name='([^']+)'\]$/);
  if (nameMatch) {
    return element.attributes.name === nameMatch[1];
  }

  return false;
}

function createCanvasContext() {
  const noop = () => undefined;
  return {
    arc: noop,
    beginPath: noop,
    clearRect: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    fill: noop,
    fillRect: noop,
    fillText: noop,
    lineTo: noop,
    moveTo: noop,
    stroke: noop,
    set fillStyle(value) {
      this._fillStyle = value;
    },
    set font(value) {
      this._font = value;
    },
    set strokeStyle(value) {
      this._strokeStyle = value;
    }
  };
}

async function waitFor(predicate, options) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < options.timeoutMs) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Launch export buttons did not render within ${options.timeoutMs}ms.`);
}

function resolveWorkspacePath(value) {
  const pathValue = String(value);
  return isAbsolute(pathValue) ? resolve(pathValue) : resolve(workspaceRoot, pathValue);
}

function parseCliArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dist" || arg === "--url" || arg === "--timeout-ms") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}.`);
      }
      index += 1;

      if (arg === "--dist") {
        options.distDir = value;
      } else if (arg === "--url") {
        options.url = value;
      } else {
        options.timeoutMs = Number(value);
      }
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: pnpm smoke:launch-exports [-- --dist dist --url https://example.com/opentop/]

Build first, then verify the production bundle renders launch export actions:
  pnpm build
  pnpm smoke:launch-exports
`);
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const result = await runLaunchExportSmoke(options);

  console.log(`Module: ${result.module}`);
  for (const check of result.checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} launch export action renders: ${check.label}`);
  }

  if (result.checks.some((check) => !check.ok)) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
