# OpenTop Launch Media Kit

Use this kit before posting OpenTop to GitHub, Product Hunt, Hacker News, Reddit, or developer newsletters. The goal is to show the actual workflow quickly: messy signal in, ranked AI app idea out, launch artifact copied.

## Core Assets

- Primary screenshot: [OpenTop app screenshot](assets/opentop-app-screenshot.png).
- Live demo capture: [OpenTop live demo capture](assets/opentop-live-demo.png).
- Demo flow visual: [OpenTop 90-second demo flow](assets/opentop-demo-flow.svg).
- Demo frame sequence: run `pnpm build` and `pnpm capture:demo-frames` to refresh the three PNG frames under `docs/assets/opentop-demo-frames/`.
- Hosted demo: [verified rawcdn fallback](https://rawcdn.githack.com/dhb118/opentop/c0cc556035b729caf53d44d9f0b4a1e5dc85adea/).
- Repo profile alt text: OpenTop interface showing AI opportunity scoring, sample briefs, and launch exports for open-source builders.

## 90-Second Demo Recording

Use the in-app `Copy Demo Script` action for the selected opportunity. Keep the recording focused on one loop:

1. Show one market signal, GitHub issue, link list, or research note.
2. Generate ranked AI app directions.
3. Open the top opportunity and explain the score matrix.
4. Copy one artifact: README brief, launch kit, Product Hunt draft, or starter repo ZIP.
5. End on the GitHub repository or hosted demo URL.

The recording should not explain every feature. It should prove that a visitor can judge the product from one concrete before/after example.

If a GIF or video recorder is not available, capture the source frames first:

```bash
pnpm build
pnpm capture:demo-frames
```

Use the generated frames as a storyboard for the final recording: load a built-in brief, compare the score explanation, then copy the demo script export.

## Product Hunt Gallery

Use three images or short clips:

1. The input signal and generated opportunity list.
2. The selected opportunity with score breakdown and first-release scope.
3. The copied launch artifact or starter repo ZIP export.

Maker comment source: use the in-app `Copy Product Hunt` action.

## Newsletter And Blog Visuals

Use one screenshot plus one generated text artifact. The strongest pairing is the live demo capture followed by a copied README brief or 90-second demo script. Link both the GitHub repository and the hosted demo.

## GitHub Social Preview

Use the primary screenshot or live demo capture until a dedicated preview image is produced. The image should communicate three things without extra explanation: score matrix, selected opportunity, and export actions.

## Publishing Checklist

- [ ] README links to the hosted demo and shows a current screenshot above the feature list.
- [ ] The selected opportunity has copied demo script, Product Hunt draft, newsletter pitch, and launch kit.
- [ ] Product Hunt gallery, README screenshot, and newsletter image all show the same product wedge.
- [ ] GitHub About metadata points to the working demo and uses the repo profile pack.
- [ ] Launch posts ask for feedback on the wedge and first-release scope, not the whole product category.
