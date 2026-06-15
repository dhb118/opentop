# OpenTop GitHub Repo Profile Pack

Use this before sending launch traffic to GitHub. The repository About panel is part of the first-screen conversion path for stars.

## GitHub About

- Description: AI opportunity radar for builders who want to choose, shape, and launch open-source AI apps.
- Website: https://rawcdn.githack.com/dhb118/opentop/5bb91b3f4d97f6502db365a7b3b17d908460e50d/
- Topics: `ai`, `typescript`, `startup-ideas`, `open-source`, `prompt-engineering`, `ollama`, `openai-compatible`, `ai-tools`, `developer-tools`, `launch-tools`, `github-readme`
- Pinned issue: https://github.com/dhb118/opentop/issues/12
- Social preview alt text: OpenTop interface showing AI opportunity scoring, sample briefs, and launch exports for open-source builders.

## GitHub CLI

```bash
gh repo edit dhb118/opentop --description "AI opportunity radar for builders who want to choose, shape, and launch open-source AI apps."
gh repo edit dhb118/opentop --homepage https://rawcdn.githack.com/dhb118/opentop/5bb91b3f4d97f6502db365a7b3b17d908460e50d/
gh repo edit dhb118/opentop --enable-issues
gh repo edit dhb118/opentop --add-topic ai --add-topic typescript --add-topic startup-ideas --add-topic open-source --add-topic prompt-engineering --add-topic ollama --add-topic openai-compatible --add-topic ai-tools --add-topic developer-tools --add-topic launch-tools --add-topic github-readme
```

## Web UI Checklist

- [ ] Open the repository About settings.
- [ ] Paste the description exactly as shown above.
- [ ] Set Website to the verified fallback demo until native GitHub Pages works.
- [ ] Add every topic listed above.
- [ ] Pin the fallback demo issue so visitors see the current hosted path and remaining Pages blocker.
- [ ] Confirm the public repository page shows the description, Website, topics, license, issues, and README screenshot above the fold.

## Apply Command

```bash
GITHUB_TOKEN=github_pat_... pnpm repo:profile:apply
```

The apply command uses the GitHub REST API to set the repository description, Website, issues setting, and discovery topics from this pack. The token must have permission to administer repository metadata.

## Audit Command

```bash
pnpm repo:profile:audit
```

The audit reads public GitHub metadata and reports whether the profile matches this pack. It does not require secrets and does not mutate GitHub.
