# Contributing to OpenTop

OpenTop is designed to be easy to fork, tune, and extend.

## Find Work

- Start with the public starter issue list in `docs/STARTER_ISSUES.md`.
- Current launch blockers are tracked in [#11](https://github.com/dhb118/opentop/issues/11), [#12](https://github.com/dhb118/opentop/issues/12), and [#13](https://github.com/dhb118/opentop/issues/13).
- Good first growth tasks are tracked in [#14](https://github.com/dhb118/opentop/issues/14), [#15](https://github.com/dhb118/opentop/issues/15), and [#16](https://github.com/dhb118/opentop/issues/16).
- Pick tasks that improve the hosted demo, launch proof, sample briefs, exports, README clarity, or the weekly gallery workflow.

## Useful Contribution Areas

- Add new scoring dimensions.
- Add sample opportunity briefs.
- Add exporters for GitHub issues, README sections, and launch posts.
- Add AI providers that support chat completions.
- Improve accessibility, keyboard navigation, and responsive behavior.

## Local Development

```bash
pnpm install
pnpm dev
```

Before opening a pull request:

```bash
pnpm build
```

## README Translations

- Keep the English and Simplified Chinese READMEs aligned when setup, feature, model, or roadmap copy changes.
- New README translations should use a locale suffix and be added to the language switcher in every README.
- Prefer human review for translation changes; avoid changing product claims in only one language.

## Product Bar

Good changes should make at least one of these stronger:

- Faster path from trend signal to concrete app idea.
- Clearer reasoning behind opportunity scores.
- Better local-first experience without API keys.
- More useful export artifacts for GitHub publishing.
- Better examples that make the project easier to understand in one minute.
