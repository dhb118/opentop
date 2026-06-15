# Demo Fallback Deploys

Use this when GitHub Pages or GitHub Actions cannot publish the live demo.

OpenTop is a static Vite app. Any host that can run `pnpm build` and publish `dist` can serve it. If the host cannot run Node, build locally and upload the demo ZIP. Keep `vite.config.ts` on relative assets so the same build works on GitHub Pages, Vercel, Netlify, and most static hosts.

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

After upload, run:

```bash
pnpm smoke:pages -- --url https://YOUR-DEMO-URL/
```

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

## Release Checklist

- [ ] The fallback demo returns HTTP 200.
- [ ] CSS and JavaScript assets load from the deployed host.
- [ ] If using GitHub Pages branch deploy, Pages source points to `gh-pages` and `/`.
- [ ] The README live demo status links to the working fallback.
- [ ] The GitHub About homepage points to the working fallback until Pages is restored.
- [ ] `dist/opentop-demo-manifest.json` matches the uploaded bundle when using a manual ZIP upload.
- [ ] The launch posts link to the working fallback, not the broken Pages URL.

When GitHub Pages recovers, keep the fallback live until the Pages smoke check also passes.
