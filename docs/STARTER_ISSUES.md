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

## 2. Add five new sample briefs from real AI builder pains

Labels: `sample-brief`, `growth`, `good-first-opportunity`

Extend the sample brief set with concrete AI developer workflows.

Acceptance:

- Each brief has a specific audience, signal, constraints, channels, and scores.
- `pnpm generate:gallery` updates docs and JSON.
- Gallery synchronization test passes.

## 3. Add keyboard navigation for opportunity cards

Labels: `ui`, `good-first-opportunity`

Improve keyboard access for selecting opportunities and activating export actions.

Acceptance:

- Tab order is predictable.
- Focus states are visible.
- Enter/Space activation works for opportunity cards and action buttons.

## 4. Import trend signals from GitHub issues

Labels: `exporter`, `scoring`, `growth`

Allow users to paste one or more GitHub issue URLs and turn titles/bodies into a consolidated signal brief.

Acceptance:

- Import works without storing credentials.
- Public issue URLs can be parsed or fetched with clear failure states.
- Imported source links remain visible in the generated signal.
- `pnpm test` and `pnpm build` pass.

## 5. Import browser bookmarks or copied link lists

Labels: `exporter`, `growth`, `good-first-opportunity`

Support pasted bookmark exports or newline-separated links as trend sources.

Acceptance:

- Pasted links are normalized into source + signal rows.
- Duplicate links are ignored.
- Invalid rows are counted and reported.

## 6. Turn benchmark examples into in-app scoring presets

Labels: `scoring`, `sample-brief`, `growth`

Use `public/benchmarks.json` to let users compare a selected opportunity against patterns from successful AI repos.

Acceptance:

- Users can inspect benchmark lessons without leaving the app.
- Every benchmark maps to one OpenTop score dimension.
- No private metrics or hard-coded star counts are introduced.

## 7. Add a scoring template marketplace

Labels: `scoring`, `ui`

Let users switch between opinionated scoring profiles, such as local-first tools, provider SDKs, agent debugging, and launch-content generators.

Acceptance:

- Templates adjust score weights in a visible, reversible way.
- The selected template is included in exported JSON.
- Existing default scoring remains available.

## 8. Export a downloadable repository scaffold

Labels: `exporter`, `growth`

Turn the selected opportunity into a local starter scaffold that can be downloaded as source files or a ZIP.

Acceptance:

- Export includes README, package metadata, source placeholders, tests, and CI workflow.
- Generated file names are safe and deterministic.
- No dependency install is required to generate the scaffold.

## 9. Add README screenshots or an animated demo GIF

Labels: `docs`, `growth`

Create visual proof above the fold for GitHub visitors.

Acceptance:

- README includes at least one current screenshot or GIF.
- Image assets are committed under `public/` or `docs/assets/`.
- Visuals show the actual OpenTop interface and one generated opportunity.

## 10. Add a label sync workflow

Labels: `docs`, `growth`

Automate creation of labels from `.github/labels.yml` so starter issues can be tagged consistently after forks or fresh repo setup.

Acceptance:

- Workflow or script reads `.github/labels.yml`.
- It documents the required GitHub token permissions.
- Running it is optional and does not affect local demo mode.
