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
3. Run the Pages smoke check:

```bash
pnpm smoke:pages
```

4. Add the hosted demo URL to the repository About section.
5. Add screenshots or a GIF to `README.md`.
6. Run the **Sync Labels** workflow or validate labels locally with `pnpm sync:labels`.
7. Create the first public issues from `docs/STARTER_ISSUES.md`.
8. Use `docs/LAUNCH_PLAYBOOK.md` for the first distribution posts.

## Publish Check

Before pushing, run:

```bash
pnpm check:publish
```

The check verifies the local branch, `origin` remote, clean working tree, current commit, and whether `dhb118/opentop` is reachable through the GitHub API.

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
- The HTML includes the OpenTop app marker.
- Built CSS and JavaScript assets referenced by the page also return HTTP 200.

If the page loads but asset checks fail, confirm the Pages workflow deployed the latest `dist` output and keep `base: "./"` in `vite.config.ts` so asset paths stay relative under `/opentop/`.

## Label Sync

Labels are defined in `.github/labels.yml`. To validate the file locally:

```bash
pnpm sync:labels
```

To create or update labels on GitHub, run the **Sync Labels** workflow from the Actions tab. The workflow uses `GITHUB_TOKEN` with `issues: write` and `contents: read` permissions.
