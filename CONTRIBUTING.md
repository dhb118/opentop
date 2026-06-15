# Contributing to OpenTop

OpenTop is designed to be easy to fork, tune, and extend.

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
