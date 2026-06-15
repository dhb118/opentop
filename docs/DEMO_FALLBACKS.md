# Demo Fallback Deploys

Use this when GitHub Pages or GitHub Actions cannot publish the live demo.

OpenTop is a static Vite app. Any host that can run `pnpm build` and publish `dist` can serve it. Keep `vite.config.ts` on relative assets so the same build works on GitHub Pages, Vercel, Netlify, and most static hosts.

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

## Release Checklist

- [ ] The fallback demo returns HTTP 200.
- [ ] CSS and JavaScript assets load from the deployed host.
- [ ] The README live demo status links to the working fallback.
- [ ] The GitHub About homepage points to the working fallback until Pages is restored.
- [ ] The launch posts link to the working fallback, not the broken Pages URL.

When GitHub Pages recovers, keep the fallback live until the Pages smoke check also passes.
