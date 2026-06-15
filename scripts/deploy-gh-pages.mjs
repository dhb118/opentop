import { spawn } from "node:child_process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDemoBundle } from "./package-demo.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "..");

export function parseDeployArgs(argv) {
  const options = {
    branch: "gh-pages",
    distDir: "dist",
    force: false,
    message: "Deploy OpenTop static demo",
    push: false,
    remote: "origin"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      return { ...options, help: true };
    }

    if (arg === "--push") {
      options.push = true;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--branch" || arg === "--dist" || arg === "--message" || arg === "--remote") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}.`);
      }
      index += 1;

      if (arg === "--branch") {
        options.branch = value;
      } else if (arg === "--dist") {
        options.distDir = value;
      } else if (arg === "--message") {
        options.message = value;
      } else {
        options.remote = value;
      }
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

export async function deployGhPages(options = {}) {
  const resolved = {
    ...parseDeployArgs([]),
    ...options
  };
  const distDir = resolveWorkspacePath(resolved.distDir);
  const publishRoot =
    resolved.publishRoot ??
    join(workspaceRoot, ".bg-shell", `gh-pages-${new Date().toISOString().replace(/[:.]/g, "-")}`);

  await createDemoBundle({ distDir });
  await assertBuiltDemo(distDir);
  await mkdir(publishRoot, { recursive: true });
  await copyDirectory(distDir, publishRoot);
  await writeFile(join(publishRoot, ".nojekyll"), "");

  await runGit(["init", "-b", resolved.branch], publishRoot);
  await configureCommitIdentity(publishRoot);
  await runGit(["add", "."], publishRoot);
  await runGit(["commit", "-m", resolved.message], publishRoot);

  if (resolved.push) {
    const remoteUrl = (await runGit(["remote", "get-url", resolved.remote], workspaceRoot, { capture: true })).trim();
    await runGit(["remote", "add", "origin", remoteUrl], publishRoot);
    const pushArgs = ["-c", "http.schannelCheckRevoke=false", "push"];
    if (resolved.force) {
      pushArgs.push("--force");
    }
    pushArgs.push("origin", resolved.branch);
    await runGit(pushArgs, publishRoot);
  }

  return {
    branch: resolved.branch,
    publishRoot,
    pushed: resolved.push
  };
}

async function configureCommitIdentity(cwd) {
  const userName = (await runGit(["config", "user.name"], workspaceRoot, { allowFailure: true, capture: true })).trim();
  const userEmail = (await runGit(["config", "user.email"], workspaceRoot, { allowFailure: true, capture: true })).trim();

  await runGit(["config", "user.name", userName || "OpenTop Deploy"], cwd);
  await runGit(["config", "user.email", userEmail || "opentop@example.com"], cwd);
}

async function copyDirectory(source, target) {
  await mkdir(target, { recursive: true });

  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    await writeFile(targetPath, await readFile(sourcePath));
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

  throw new Error("Missing dist/index.html. Run pnpm build before pnpm deploy:pages:branch.");
}

function resolveWorkspacePath(value) {
  const pathValue = String(value);
  return isAbsolute(pathValue) ? resolve(pathValue) : resolve(workspaceRoot, pathValue);
}

function runGit(args, cwd, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("git", args, {
      cwd,
      shell: false,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stdout = "";
    let stderr = "";

    if (options.capture) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0 || options.allowFailure) {
        resolvePromise(stdout);
        return;
      }

      rejectPromise(new Error(`git ${args.join(" ")} failed with exit code ${code}${stderr ? `: ${stderr}` : ""}`));
    });
  });
}

function printHelp() {
  console.log(`Usage: pnpm deploy:pages:branch [-- --push --force --branch gh-pages]

Build and publish a static GitHub Pages branch:
  pnpm build
  pnpm deploy:pages:branch

Push the branch after preparing it:
  pnpm deploy:pages:branch -- --push

Options:
  --push              push the generated branch to origin
  --force             force-push the generated branch
  --branch <name>     branch name, defaults to gh-pages
  --dist <path>       built static directory, defaults to dist
  --message <text>    deploy commit message
  --remote <name>     source remote to read from the main repo, defaults to origin
`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseDeployArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
    } else {
      const result = await deployGhPages(options);
      console.log(`Prepared ${result.branch}: ${relative(workspaceRoot, result.publishRoot)}`);
      console.log(result.pushed ? "Pushed branch to origin." : "Dry run only. Re-run with -- --push to publish.");
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
