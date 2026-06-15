# Demo Fallback Deploys

Use this when GitHub Pages or GitHub Actions cannot publish the live demo.

OpenTop is a static Vite app. Any host that can run `pnpm build` and publish `dist` can serve it. If the host cannot run Node, build locally and upload the demo ZIP. Keep `vite.config.ts` on relative assets so the same build works on GitHub Pages, Vercel, Netlify, and most static hosts.

Current verified fallback:

- Demo URL: https://raw.githack.com/dhb118/opentop/gh-pages/
- Source: latest pushed `gh-pages` branch.
- Reason: GitHub Actions jobs currently do not start because the account is locked by a billing issue, so the GitHub Pages workflow cannot deploy.

Current verified fixed demo:

- Demo URL: https://rawcdn.githack.com/dhb118/opentop/8af0b223db437d2c8235232e32e85ed9b8e6ca8c/
- Source: `gh-pages` commit `8af0b223db437d2c8235232e32e85ed9b8e6ca8c`.
- Use this URL in README, GitHub About, and launch posts while the branch URL is CDN-cached or GitHub Pages is blocked.

Do not use jsDelivr as the primary demo URL for `index.html`: it can return the HTML with `text/plain`, which passes a plain HTTP 200 check but does not behave like a browser-hosted app.

## Vercel

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdhb118%2Fopentop&project-name=opentop&repository-name=opentop)

The committed Vercel config uses:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`

After deployment, run:

```bash
pnpm smoke:pages -- --url https://YOUR-VERCEL-APP.vercel.app/
```

## Netlify

[Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/dhb118/opentop)

The committed Netlify config uses:

- Build command: `pnpm build`
- Publish directory: `dist`
- Node version: `22`

After deployment, run:

```bash
pnpm smoke:pages -- --url https://YOUR-NETLIFY-SITE.netlify.app/
```

## Static ZIP Bundle

Use this when GitHub Actions is blocked or a host only accepts a manual static upload.

```bash
pnpm build
pnpm package:demo
```

This writes:

- `dist/opentop-demo.zip`: uploadable static demo archive.
- `dist/opentop-demo-manifest.json`: file count, byte count, and SHA-256 checksums for the bundle contents.

Upload either the extracted `dist` directory or `dist/opentop-demo.zip` to a static host such as Cloudflare Pages Direct Upload, Render Static Sites, Surge, or an internal web server.

For Cloudflare-specific steps, use [Cloudflare Pages Direct Upload](CLOUDFLARE_PAGES.md). Wrangler accepts the `dist` directory, while Cloudflare dashboard drag-and-drop accepts either the directory or `dist/opentop-demo.zip`.

After upload, run:

```bash
pnpm smoke:pages -- --url https://YOUR-DEMO-URL/
```

The smoke check requires the entry page to return `text/html`, contain the OpenTop marker, and load referenced CSS/JavaScript assets with HTTP 200.

## GitHub Pages Branch Deploy

Use this when GitHub Actions cannot run but the repository can serve Pages from a branch.

```bash
pnpm build
pnpm deploy:pages:branch -- --push
```

Then open the repository settings and set **Pages > Build and deployment > Source** to:

- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/`

The script writes the same static build, `.nojekyll`, `opentop-demo.zip`, and `opentop-demo-manifest.json` to the `gh-pages` branch. It does not push unless `--push` is present.

When GitHub Pages settings are unavailable, the pushed branch can still be served through raw.githack:

```bash
pnpm smoke:pages -- --url https://raw.githack.com/dhb118/opentop/gh-pages/
```

If the branch URL is cached, smoke the fixed rawcdn commit URL instead:

```bash
pnpm smoke:pages -- --url https://rawcdn.githack.com/dhb118/opentop/8af0b223db437d2c8235232e32e85ed9b8e6ca8c/
```

## Release Checklist

- [ ] The fallback demo returns HTTP 200.
- [ ] CSS and JavaScript assets load from the deployed host.
- [ ] If using GitHub Pages branch deploy, Pages source points to `gh-pages` and `/`.
- [ ] The README live demo status links to the working fallback.
- [ ] The GitHub About homepage points to the working fallback until Pages is restored.
- [ ] `dist/opentop-demo-manifest.json` matches the uploaded bundle when using a manual ZIP upload.
- [ ] The launch posts link to the working fallback, not the broken Pages URL.

When GitHub Pages recovers, keep the fallback live until the Pages smoke check also passes.
