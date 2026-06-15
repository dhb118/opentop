# GitHub Publish Guide

The local repository is ready to publish after `pnpm build` passes.

## Option A: GitHub Web UI

1. Create a new public repository named `opentop`.
2. Do not initialize it with README, license, or gitignore.
3. Add the remote locally:

```bash
git remote add origin https://github.com/<owner>/opentop.git
git push -u origin main
```

## Option B: GitHub CLI

Install GitHub CLI on Windows:

```bash
winget install GitHub.cli
```

Authenticate:

```bash
gh auth login
```

Create and push:

```bash
gh repo create opentop --public --source . --remote origin --push
```

## After Push

1. Confirm GitHub Actions passes.
2. Enable GitHub Pages with **Source: GitHub Actions**.
3. If Actions or Pages cannot run, publish a temporary `gh-pages` branch, Vercel, Netlify, Cloudflare Pages Direct Upload, or static ZIP fallback from `docs/DEMO_FALLBACKS.md`.
4. Run the Pages or fallback smoke check:

```bash
pnpm smoke:pages -- --url https://YOUR-DEMO-URL/
```

5. Print and apply the repo profile pack:

```bash
pnpm repo:profile
pnpm repo:profile:audit
```

6. Add the hosted demo URL to the repository About section.
7. Add the topics from [Repo Profile Pack](REPO_PROFILE.md).
8. Pin the fallback demo issue from the profile pack until GitHub Pages works.
9. Add screenshots or a GIF to `README.md`.
10. Run the **Sync Labels** workflow or validate labels locally with `pnpm sync:labels`.
11. Create the first public issues from `docs/STARTER_ISSUES.md`.
12. Use `docs/LAUNCH_PLAYBOOK.md` for the first distribution posts.

## Publish Check

Before pushing, run:

```bash
pnpm check:publish
```

The check verifies the local branch, `origin` remote, clean working tree, current commit, and whether `dhb118/opentop` is reachable through the GitHub API.

## Repo Profile Check

Before broad launch, print the exact GitHub About metadata and compare it with the public repository state:

```bash
pnpm repo:profile
pnpm repo:profile:audit
```

The audit is read-only. It reports whether the public repository has the expected description, verified demo homepage, topics, and issue visibility.

## Pages Smoke Check

After the Pages workflow finishes, run:

```bash
pnpm smoke:pages
```

By default the script checks the `homepage` URL from `package.json`. To test a fork or preview URL:

```bash
pnpm smoke:pages -- --url https://<owner>.github.io/opentop/
```

The smoke check verifies:

- The hosted page returns HTTP 200.
- The hosted page is served as `text/html`.
- The HTML includes the OpenTop app marker.
- Built CSS and JavaScript assets referenced by the page also return HTTP 200.

If the page loads but asset checks fail, confirm the Pages workflow deployed the latest `dist` output and keep `base: "./"` in `vite.config.ts` so asset paths stay relative under `/opentop/`.

## Launch Export Smoke Check

Before publishing a demo URL, verify the production bundle renders the export actions visitors need for launch artifacts:

```bash
pnpm build
pnpm smoke:launch-exports
```

The check runs the built app module in a lightweight DOM harness and verifies `Copy Launch Brief`, `Copy Launch Kit`, `Copy Product Hunt`, `Copy Newsletter`, `Copy Star Plan`, and `Download Repo ZIP` render.

## Fallback Demo Hosts

If GitHub Pages is blocked by account settings, billing, or Actions availability, use `docs/DEMO_FALLBACKS.md` to publish the same static build on Vercel, Netlify, Cloudflare Pages Direct Upload, raw.githack/rawcdn over the `gh-pages` branch, or another static host. The Vercel and Netlify configs are committed:

- `vercel.json` builds with `pnpm build` and publishes `dist`.
- `netlify.toml` builds with `pnpm build` and publishes `dist`.
- `pnpm package:demo` writes `dist/opentop-demo.zip` and `dist/opentop-demo-manifest.json` for hosts that need a manual static upload.
- `pnpm deploy:pages:branch -- --push` publishes the static build to `gh-pages` for branch-based GitHub Pages deploys.
- `https://rawcdn.githack.com/dhb118/opentop/c649701ee280ef1e1aab6d86eb2affc98553e2d8/` serves the verified pushed branch build while GitHub Actions is blocked.
- `docs/CLOUDFLARE_PAGES.md` explains when to upload `dist` directly and when to use the generated ZIP.

After a fallback deploy passes `pnpm smoke:pages -- --url https://YOUR-DEMO-URL/`, use that URL in the GitHub About homepage and launch posts until Pages recovers.

## Label Sync

Labels are defined in `.github/labels.yml`. To validate the file locally:

```bash
pnpm sync:labels
```

To create or update labels on GitHub, run the **Sync Labels** workflow from the Actions tab. The workflow uses `GITHUB_TOKEN` with `issues: write` and `contents: read` permissions.
