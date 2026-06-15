# OpenTop Launch Playbook

This playbook turns the repository into a real GitHub launch asset.

## Pre-Launch

1. Create a public GitHub repository named `opentop`.
2. Enable GitHub Pages, Vercel, Netlify, or Cloudflare Pages for the hosted demo.
3. Use the [Launch Media Kit](LAUNCH_MEDIA_KIT.md) to record a 90-second demo from one selected opportunity.
4. Add current screenshots or the demo recording to the README.
5. If GitHub Pages is blocked, publish the fallback demo from `docs/DEMO_FALLBACKS.md`.
6. Run `pnpm deploy:pages:branch -- --push` after `pnpm build` if Pages can serve from `gh-pages` but Actions cannot run.
7. Run `pnpm package:demo` after `pnpm build` so a manual static ZIP is ready even when CI is unavailable.
8. Run `pnpm smoke:pages -- --url https://YOUR-DEMO-URL/` against the hosted demo.
9. Create labels from `.github/labels.yml`.
10. Open starter issues from `docs/STARTER_ISSUES.md` so new visitors can contribute immediately.
11. Use the [Weekly Gallery Update Workflow](WEEKLY_GALLERY_WORKFLOW.md) so launch examples stay current after the first post.
12. Export the selected opportunity's Star Growth Plan and use it to stage the 1, 10, 100, 1k, and 10k star loops.
13. Review the Public Launch Brief so every post has the same demo story, proof checklist, channel sequence, and follow-up loop.
14. Export the GitHub Repo Listing Pack and apply the About description, topics, homepage, social preview, and pinned issue before posting.
15. Copy the demo script, Product Hunt draft, and newsletter pitch from the launch export panel.
16. Copy the build log draft and publish it as a transparent before/after story once the demo and first README proof are ready.
17. Run README Star Audit and copy the 7-day sprint so top fixes have owners before broad launch.

## Launch Copy

Short:

> OpenTop turns messy AI trend signals into ranked, GitHub-ready app ideas with scoring, launch plans, and no-key local mode.

Long:

> I built OpenTop because AI builders are surrounded by trends but still struggle to pick a sharp wedge. Paste a market signal, describe the audience and constraints, and OpenTop ranks concrete TypeScript app ideas by pain, urgency, distribution, buildability, and star potential. It works locally without an API key and can also call OpenAI-compatible APIs or Ollama.

## Distribution Checklist

- GitHub README with demo GIF above the fold.
- Hacker News "Show HN" post with one clear before/after example.
- Product Hunt launch with a short screen recording and maker comment from the generated draft.
- Reddit post in `r/LocalLLaMA` focused on Ollama/local mode.
- X/Twitter thread showing 4 generated app ideas from one trend signal.
- AI engineering newsletter pitch with the same proof points as the README and public launch brief.
- Blog post explaining the scoring model and inviting pull requests.

## 10k Star Strategy

OpenTop cannot earn 10k stars from code alone. The repository needs compounding proof:

- Weekly gallery updates with real generated ideas.
- [Weekly Gallery Update Workflow](WEEKLY_GALLERY_WORKFLOW.md) checks that each new example has public signals, a clear quality bar, regeneration commands, and launch-doc review.
- Public issues for every requested provider and exporter.
- Exported Star Growth Plans that turn each selected wedge into staged proof, contribution, and distribution work.
- Public Launch Briefs that keep demo story, proof, channel copy, and follow-up tasks aligned across launch surfaces.
- [Launch Media Kit](LAUNCH_MEDIA_KIT.md) assets that keep screenshots, recordings, Product Hunt gallery, and newsletter visuals pointed at one proof loop.
- Product Hunt drafts and newsletter pitches that reuse the strongest proof instead of inventing new copy per channel.
- Repo listing packs that keep GitHub About metadata, topics, and pinned issues aligned with the sharpest wedge.
- 7-day readiness sprints that convert README and repository profile gaps into launch-gate tasks.
- A fallback demo host, `gh-pages` branch deploy, and uploadable static ZIP when GitHub Pages Actions are unavailable.
- Fast maintainer response for the first 100 contributors.
- A hosted demo that works before visitors read the README.
- Clear positioning: not another chatbot, but a decision tool for builders.
