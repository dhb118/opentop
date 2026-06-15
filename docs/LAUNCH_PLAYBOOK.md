# OpenTop Launch Playbook

This playbook turns the repository into a real GitHub launch asset.

## Pre-Launch

1. Create a public GitHub repository named `opentop`.
2. Enable GitHub Pages, Vercel, Netlify, or Cloudflare Pages for the hosted demo.
3. Record a 90-second demo using the sample briefs.
4. Add three screenshots to the README.
5. Run `pnpm smoke:pages` against the hosted demo.
6. Create labels from `.github/labels.yml`.
7. Open starter issues from `docs/STARTER_ISSUES.md` so new visitors can contribute immediately.
8. Export the selected opportunity's Star Growth Plan and use it to stage the 1, 10, 100, 1k, and 10k star loops.

## Launch Copy

Short:

> OpenTop turns messy AI trend signals into ranked, GitHub-ready app ideas with scoring, launch plans, and no-key local mode.

Long:

> I built OpenTop because AI builders are surrounded by trends but still struggle to pick a sharp wedge. Paste a market signal, describe the audience and constraints, and OpenTop ranks concrete TypeScript app ideas by pain, urgency, distribution, buildability, and star potential. It works locally without an API key and can also call OpenAI-compatible APIs or Ollama.

## Distribution Checklist

- GitHub README with demo GIF above the fold.
- Hacker News "Show HN" post with one clear before/after example.
- Product Hunt launch with a short screen recording.
- Reddit post in `r/LocalLLaMA` focused on Ollama/local mode.
- X/Twitter thread showing 4 generated app ideas from one trend signal.
- Blog post explaining the scoring model and inviting pull requests.

## 10k Star Strategy

OpenTop cannot earn 10k stars from code alone. The repository needs compounding proof:

- Weekly gallery updates with real generated ideas.
- Public issues for every requested provider and exporter.
- Exported Star Growth Plans that turn each selected wedge into staged proof, contribution, and distribution work.
- Fast maintainer response for the first 100 contributors.
- A hosted demo that works before visitors read the README.
- Clear positioning: not another chatbot, but a decision tool for builders.
