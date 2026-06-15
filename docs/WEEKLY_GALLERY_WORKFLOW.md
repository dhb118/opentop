# Weekly Gallery Update Workflow

Use this workflow once a week to keep OpenTop's public examples current. The reader is a maintainer or contributor who wants to add better AI builder examples without changing the product code.

After reading this page, you should be able to collect one new signal, turn it into a sample brief, regenerate the gallery, and decide whether the launch docs need a refresh.

## Weekly Loop

1. Pick one to three current AI builder signals from public sources.
2. Convert each signal into a concrete sample brief.
3. Regenerate the gallery docs and data.
4. Run the local quality gate.
5. Update launch docs only when the new brief is stronger than the current demo story.

## Signal Sources

Use public, linkable sources that a future reader can recognize:

- GitHub issues from AI tools, SDKs, agent frameworks, RAG projects, eval tools, or local model projects.
- Hacker News, Reddit, Discord, or newsletter discussions about repeated AI builder pain.
- Provider migration notes, model release threads, pricing changes, or API compatibility problems.
- Maintainer feedback from OpenTop issues, demo comments, or launch replies.

Do not use private customer data, private metrics, copied proprietary prompts, or unsupported adoption claims.

## Sample Brief Quality Bar

A gallery brief is ready when it has all of these:

- A specific audience, not "AI users" or "developers" in general.
- A real workflow pain that can be understood in one sentence.
- Constraints that make the first release small enough to build.
- Channels where the audience already looks for tools.
- Pain, urgency, and distribution scores on the public 1-10 scale.
- No claim that depends on hidden revenue, user, or star data.

Prefer examples that strengthen OpenTop's launch story:

- local-first AI tools
- agent debugging
- RAG quality and fixtures
- eval and regression workflows
- provider migration and compatibility
- release readiness for open-source AI projects

## Collection Template

```text
Audience:
Signal:
Constraints:
Channels:
Pain:
Urgency:
Distribution:
Source link:
Why this belongs in OpenTop:
```

## Update Steps

1. Add or refine the sample brief in the built-in brief library.
2. Keep the title short and specific.
3. Keep the signal grounded in one recognizable pain.
4. Run:

```bash
pnpm generate:gallery
pnpm test
pnpm build
```

5. Review the generated gallery entry as a cold GitHub visitor.

The update is not ready if the new example only sounds interesting but does not produce a clear ranked opportunity, launch brief, and contribution path.

## Launch Doc Review

If the new example is stronger than the current demo story, update the launch materials in the same change:

- Public launch brief: use the new example as the before/after story.
- Launch media kit: align the recording script and visual checklist with the new example.
- Starter issues: add a follow-up task if contributors can extend the example.
- README: only change the top-level story when the new example is easier for a first-time visitor to understand.

If the example is useful but not stronger than the current demo, leave the launch story alone and only update the gallery.

## Done Checklist

- [ ] The new brief uses public, non-private input.
- [ ] The gallery data and docs were regenerated.
- [ ] `pnpm test` passed.
- [ ] `pnpm build` passed.
- [ ] Launch docs were updated or intentionally left unchanged.
- [ ] Any follow-up contribution task is linked from the starter issue list.
