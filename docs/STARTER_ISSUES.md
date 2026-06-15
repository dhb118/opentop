# Starter Issues

Use these as the first public issues for visitors who want to help OpenTop become a launchable, star-worthy GitHub project. Each issue should be small enough for a new contributor to understand without reading the whole codebase.

## Labels

Create labels from [.github/labels.yml](../.github/labels.yml), then apply the suggested labels below.

## 1. Enable the working GitHub Pages branch demo

Labels: `docs`, `growth`, `good-first-opportunity`

OpenTop now publishes a static build to the `gh-pages` branch. Finish the repository settings so the public demo URL works without GitHub Actions.

Acceptance:

- Repository Pages source is set to `Deploy from a branch`.
- Branch is `gh-pages` and folder is `/`.
- `pnpm smoke:pages -- --url https://dhb118.github.io/opentop/` passes.
- README and GitHub About homepage point to the working demo URL.

## 2. Record a 90-second product demo GIF or video

Labels: `docs`, `growth`, `good-first-opportunity`

Create visual proof that shows the actual OpenTop workflow from signal input to a selected opportunity and export action.

Acceptance:

- The recording uses the current UI and one built-in sample brief.
- It shows a generated opportunity, score explanation, and one launch export.
- README includes the visual above or near the first feature list.
- The visual is committed under `docs/assets/` or linked from a stable public URL.

## 3. Keep end-to-end smoke coverage for launch exports current

Labels: `ui`, `exporter`, `growth`

Keep the lightweight DOM harness current so the most important export buttons render after a production build.

Acceptance:

- The check verifies `Copy Launch Brief`, `Copy Launch Kit`, `Copy Star Plan`, and `Download Repo ZIP` are present.
- It runs against the production build output or a local preview server.
- The command is documented in the local quality gate.
- Existing `pnpm test` and `pnpm build` still pass.

## 4. Keep high-quality AI builder sample briefs current

Labels: `sample-brief`, `growth`, `good-first-opportunity`

Keep the gallery full of recognizable AI developer workflows that make OpenTop easier to judge from examples.

Acceptance:

- At least 14 briefs are available in the built-in library.
- Each brief has a specific audience, signal, constraints, channels, and score inputs.
- At least seven briefs focus on local-first AI or agent debugging.
- `pnpm generate:gallery` updates the public gallery JSON and docs.
- Gallery synchronization tests pass.

## 5. Add a launch evidence section to the README

Labels: `docs`, `growth`

Make the README easier for a cold GitHub visitor to trust before they clone the repository.

Acceptance:

- README shows the working demo status, screenshot or GIF, local quick start, and one generated example near the top.
- It avoids unsupported claims about star counts or adoption.
- It links to the public launch brief, gallery, benchmark examples, and starter issues.
- English and Simplified Chinese README files stay aligned.

## 6. Refine the public launch brief with real feedback

Labels: `growth`, `docs`

Keep the public launch brief useful as demo status, screenshots, examples, and launch feedback change.

Acceptance:

- The launch brief still includes a one-liner, demo story, proof checklist, channel sequence, follow-up loop, and feedback ask.
- It points to the working demo or current fallback path.
- It incorporates at least one concrete launch feedback item or demo-status update.
- README and the launch playbook still link to it.

## 7. Keep Cloudflare Pages direct-upload instructions current

Labels: `docs`, `growth`

Keep the documented fallback path current for cases where GitHub Pages or Actions are unavailable.

Acceptance:

- The guide starts from `pnpm build` and `pnpm package:demo`.
- It explains whether to upload the extracted `dist` directory or the ZIP contents.
- It includes the smoke-check command for the deployed URL.
- It clarifies when to switch README and GitHub About homepage to the fallback URL.

## 8. Add a weekly gallery update workflow

Labels: `sample-brief`, `growth`

Create a repeatable process for keeping OpenTop's public examples fresh after launch.

Acceptance:

- The workflow explains how to collect new AI builder signals.
- It defines the minimum quality bar for a sample brief.
- It includes commands for regenerating gallery assets and running tests.
- It avoids private metrics and unsupported star claims.
