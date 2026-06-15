# Starter Issues

Use these as the first public issues after pushing the repository. They are written to give new visitors obvious ways to contribute within the first minute.

## Labels

Create labels from [.github/labels.yml](../.github/labels.yml), then apply the suggested labels below.

## 1. Add cloud-specific Anthropic provider variants

Labels: `provider`, `good-first-opportunity`

OpenTop currently supports demo mode, OpenAI-compatible endpoints, the direct Anthropic Messages API, and Ollama-compatible endpoints. Add optional presets for Anthropic access through cloud platforms without hard-coding secrets.

Acceptance:

- Direct Anthropic support remains available.
- Cloud provider endpoint/model defaults are documented.
- No API key is committed or logged.
- `pnpm test` and `pnpm build` pass.

## 2. Export a GitHub issue body from the selected opportunity

Labels: `exporter`, `good-first-opportunity`, `growth`

Add an export action that copies a GitHub issue body for the selected opportunity.

Acceptance:

- Export includes problem, target user, first-release scope, and risks.
- Button label is clear on desktop and mobile.
- Existing README, Show HN, share link, and JSON exports still work.

## 3. Add a weighted scoring explanation panel

Labels: `scoring`, `ui`

Show how the top score is calculated from pain, urgency, distribution, buildability, and star potential.

Acceptance:

- Users can inspect the score without reading source code.
- Explanation is specific to the selected opportunity.
- No layout shift in desktop or mobile views.

## 4. Add five new sample briefs from real AI builder pains

Labels: `sample-brief`, `growth`, `good-first-opportunity`

Extend the sample brief set with concrete AI developer workflows.

Acceptance:

- Each brief has a specific audience, signal, constraints, channels, and scores.
- `pnpm generate:gallery` updates docs and JSON.
- Gallery synchronization test passes.

## 5. Add share-card image generation for selected opportunities

Labels: `exporter`, `growth`

Create a local canvas export that turns the selected opportunity into a shareable image.

Acceptance:

- Exported image includes name, score, wedge, and repo hook.
- Works without a backend or model API.
- Image is readable at social preview dimensions.

## 6. Add keyboard navigation for opportunity cards

Labels: `ui`, `good-first-opportunity`

Improve keyboard access for selecting opportunities and activating export actions.

Acceptance:

- Tab order is predictable.
- Focus states are visible.
- Enter/Space activation works for opportunity cards and action buttons.

## 7. Add CSV import for trend signals

Labels: `exporter`, `scoring`

Allow users to paste or upload a small CSV of trend notes and turn it into a consolidated signal brief.

Acceptance:

- CSV parsing is local-only.
- Invalid rows are ignored with a clear count.
- Generated signal can be edited before analysis.

## 8. Add a model response repair layer

Labels: `provider`, `scoring`

When a real model returns malformed JSON, repair or gracefully fall back to the local engine.

Acceptance:

- Empty or invalid model responses never break the UI.
- Error summary explains what happened.
- Local fallback still produces opportunities.

## 9. Add benchmark examples for well-known AI repos

Labels: `sample-brief`, `docs`, `growth`

Create a gallery section that explains why successful AI repos had strong distribution and contributor hooks.

Acceptance:

- Examples are factual and concise.
- No claims about private metrics.
- Each example maps to one OpenTop scoring dimension.

## 10. Add GitHub Pages post-deploy smoke check

Labels: `docs`, `growth`

Document or automate a basic check that the deployed demo loads after the Pages workflow finishes.

Acceptance:

- The check verifies HTTP 200 for the Pages URL.
- The guide explains how to diagnose broken asset paths.
- Pages workflow remains simple for contributors.
