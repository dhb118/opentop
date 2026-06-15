# Cloudflare Pages Direct Upload

Use this path when GitHub Pages or GitHub Actions is blocked and OpenTop still needs a public demo URL for launch posts.

Cloudflare Pages Direct Upload serves prebuilt static assets. It is a good fit for OpenTop because the app builds to static files and does not need a server.

## Build the Demo

Run the local production build and package the same assets for manual upload:

```bash
pnpm build
pnpm package:demo
```

This creates a production `dist` directory, plus `opentop-demo.zip` and `opentop-demo-manifest.json` inside it.

## Upload with Wrangler

Use Wrangler when you can log in from a terminal and want repeatable deployments.

```bash
npx wrangler login
npx wrangler pages project create
npx wrangler pages deploy dist
```

Choose `opentop` as the project name if it is available. The deployed demo will use a `pages.dev` URL.

Wrangler uploads a single folder of assets. Do not pass the ZIP file to Wrangler.

## Upload from the Cloudflare Dashboard

Use dashboard upload when you need the fastest manual fallback.

1. Open Cloudflare **Workers & Pages**.
2. Choose **Create application**.
3. Choose **Get started**, then **Drag and drop your files**.
4. Enter a project name, such as `opentop`.
5. Upload either the `dist` directory or `opentop-demo.zip`.
6. Deploy the site and copy the generated `pages.dev` URL.

Dashboard drag-and-drop accepts either one asset folder or a ZIP archive. For OpenTop, both the extracted build directory and the generated demo ZIP contain the same deployable static site.

## Verify the URL

After Cloudflare finishes the deployment, run:

```bash
pnpm smoke:pages -- --url https://YOUR-PROJECT.pages.dev/
```

The smoke check must verify the page, CSS, and JavaScript assets before the URL is used in README, GitHub About, or launch posts.

## Switch Launch Links

Use the Cloudflare URL as the temporary public demo when GitHub Pages is unavailable:

- Update the README live demo status if this becomes the main demo path.
- Set the GitHub About homepage to the Cloudflare URL.
- Use the Cloudflare URL in the public launch brief and launch posts.
- Keep the Cloudflare deployment live until the GitHub Pages smoke check passes again.

## Notes

- Direct Upload projects cannot later switch to Cloudflare Git integration. Create a separate Git-integrated project if automatic Cloudflare deploys become the long-term path.
- If the dashboard reports a file-count or file-size error, upload the ZIP instead of the folder or use Wrangler.
- The generated manifest records file names, byte counts, and SHA-256 checksums so the uploaded bundle can be compared against the local build.
- Reference: [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).
