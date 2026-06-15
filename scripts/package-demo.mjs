import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "..");
const textEncoder = new TextEncoder();
const zipDate = (1 << 5) | 1;
const zipTime = 0;
let crcTable = null;

export async function createDemoBundle(options = {}) {
  const distDir = resolveWorkspacePath(options.distDir ?? "dist");
  const outFile = resolveWorkspacePath(options.outFile ?? join(distDir, "opentop-demo.zip"));
  const manifestFile = resolveWorkspacePath(options.manifestFile ?? join(distDir, "opentop-demo-manifest.json"));

  await assertBuiltDemo(distDir);

  const packageJson = JSON.parse(await readFile(join(workspaceRoot, "package.json"), "utf8"));
  const files = await collectDemoFiles(distDir, {
    exclude: [outFile, manifestFile]
  });
  const manifest = buildDemoManifest(files, {
    packageName: packageJson.name,
    version: packageJson.version,
    createdAt: options.createdAt
  });
  const manifestBytes = textEncoder.encode(`${JSON.stringify(manifest, null, 2)}\n`);
  const bundledFiles = [...files, { path: "opentop-demo-manifest.json", bytes: manifestBytes }];
  const zipBytes = buildDemoZipBytes(bundledFiles);

  await mkdir(dirname(manifestFile), { recursive: true });
  await writeFile(manifestFile, manifestBytes);
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, zipBytes);

  return {
    outFile,
    manifestFile,
    manifest,
    zipBytes
  };
}

export async function collectDemoFiles(distDir, options = {}) {
  const root = resolveWorkspacePath(distDir);
  const excludes = new Set((options.exclude ?? []).map((item) => resolveWorkspacePath(item)));
  const files = [];

  await collectFiles(root, root, excludes, files);

  return normalizeDemoFiles(files);
}

export function buildDemoManifest(files, options = {}) {
  const normalized = normalizeDemoFiles(files);
  const totalBytes = normalized.reduce((total, file) => total + file.bytes.length, 0);

  return {
    name: options.packageName ?? "opentop",
    version: options.version ?? "0.0.0",
    entry: "index.html",
    createdAt: options.createdAt ?? new Date().toISOString(),
    fileCount: normalized.length,
    totalBytes,
    uploadHint: "Upload the contents of dist or opentop-demo.zip to any static host.",
    files: normalized.map((file) => ({
      path: file.path,
      bytes: file.bytes.length,
      sha256: createHash("sha256").update(file.bytes).digest("hex")
    }))
  };
}

export function buildDemoZipBytes(files) {
  const normalized = normalizeDemoFiles(files);
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  if (normalized.length > 0xffff) {
    throw new Error("Demo bundle has too many files for this ZIP writer.");
  }

  for (const file of normalized) {
    const nameBytes = textEncoder.encode(file.path);
    const contentBytes = file.bytes;
    const crc = crc32(contentBytes);
    const localHeader = createLocalFileHeader(nameBytes.length, contentBytes.length, crc);
    const centralHeader = createCentralDirectoryHeader(nameBytes.length, contentBytes.length, crc, offset);

    localParts.push(localHeader, nameBytes, contentBytes);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = createEndRecord(normalized.length, centralSize, centralOffset);

  return concatBytes([...localParts, ...centralParts, endRecord]);
}

function normalizeDemoFiles(files) {
  return files
    .map((file) => ({
      path: normalizeBundlePath(file.path),
      bytes: toBytes(file.bytes ?? file.content ?? "")
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function collectFiles(root, currentDir, excludes, files) {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = resolve(currentDir, entry.name);

    if (excludes.has(absolutePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await collectFiles(root, absolutePath, excludes, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    files.push({
      path: relative(root, absolutePath),
      bytes: new Uint8Array(await readFile(absolutePath))
    });
  }
}

async function assertBuiltDemo(distDir) {
  try {
    const indexStats = await stat(join(distDir, "index.html"));
    if (indexStats.isFile()) {
      return;
    }
  } catch {
    // The explicit error below is clearer than leaking ENOENT.
  }

  throw new Error("Missing dist/index.html. Run pnpm build before pnpm package:demo.");
}

function resolveWorkspacePath(value) {
  if (value instanceof URL) {
    return fileURLToPath(value);
  }

  const pathValue = String(value);
  return isAbsolute(pathValue) ? resolve(pathValue) : resolve(workspaceRoot, pathValue);
}

function normalizeBundlePath(value) {
  const normalized = String(value).replace(/\\/g, "/").replace(/^\/+/, "");

  if (!normalized || normalized.includes("../") || normalized === "..") {
    throw new Error(`Unsafe bundle path: ${value}`);
  }

  return normalized;
}

function toBytes(value) {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  return textEncoder.encode(String(value));
}

function createLocalFileHeader(filenameLength, size, crc) {
  assertZipSize(filenameLength, size);

  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, zipTime, true);
  view.setUint16(12, zipDate, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, filenameLength, true);
  view.setUint16(28, 0, true);
  return header;
}

function createCentralDirectoryHeader(filenameLength, size, crc, offset) {
  assertZipSize(filenameLength, size);

  if (offset > 0xffffffff) {
    throw new Error("Demo bundle is too large for this ZIP writer.");
  }

  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, zipTime, true);
  view.setUint16(14, zipDate, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, filenameLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  return header;
}

function createEndRecord(entries, centralSize, centralOffset) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entries, true);
  view.setUint16(10, entries, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return header;
}

function assertZipSize(filenameLength, size) {
  if (filenameLength > 0xffff || size > 0xffffffff) {
    throw new Error("Demo bundle is too large for this ZIP writer.");
  }
}

function concatBytes(parts) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function crc32(bytes) {
  const table = getCrcTable();
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function getCrcTable() {
  if (crcTable) {
    return crcTable;
  }

  crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crcTable[index] = value >>> 0;
  }

  return crcTable;
}

function parseCliArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--dist" || arg === "--out" || arg === "--manifest") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}.`);
      }
      index += 1;

      if (arg === "--dist") {
        options.distDir = value;
      } else if (arg === "--out") {
        options.outFile = value;
      } else {
        options.manifestFile = value;
      }
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: pnpm package:demo [-- --dist dist --out dist/opentop-demo.zip --manifest dist/opentop-demo-manifest.json]

Build first, then package the static demo:
  pnpm build
  pnpm package:demo
`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseCliArgs(process.argv.slice(2));

    if (options.help) {
      printHelp();
    } else {
      const result = await createDemoBundle(options);
      console.log(`Demo bundle: ${relative(workspaceRoot, result.outFile)}`);
      console.log(`Manifest: ${relative(workspaceRoot, result.manifestFile)}`);
      console.log(`Files: ${result.manifest.fileCount}`);
      console.log(`Bytes: ${result.zipBytes.length}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
