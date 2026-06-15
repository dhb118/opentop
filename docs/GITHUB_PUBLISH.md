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
3. Add the hosted demo URL to the repository About section.
4. Add screenshots or a GIF to `README.md`.
5. Create labels from `.github/labels.yml`.
6. Create the first public issues from `docs/STARTER_ISSUES.md`.
7. Use `docs/LAUNCH_PLAYBOOK.md` for the first distribution posts.

## Publish Check

Before pushing, run:

```bash
pnpm check:publish
```

The check verifies the local branch, `origin` remote, clean working tree, current commit, and whether `dhb118/opentop` is reachable through the GitHub API.
