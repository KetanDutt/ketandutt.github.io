# Deployment

## GitHub Pages

The project is production-ready as a root-level static GitHub Pages site.

1. In the repository, open **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select the publishing branch and `/ (root)`.
4. Save and wait for the Pages deployment to complete.

No build command or output directory is required.

## Local release check

```bash
npm test
npm run dev
```

Then inspect `http://localhost:4173` and verify:

- no errors in the browser console;
- `config.json`, portrait, favicon, résumé, and manifest return HTTP 200;
- project filtering, search, theme persistence, and mobile navigation work;
- all external links open safely in a separate tab;
- the page remains usable with network throttling and the GitHub API blocked.

## Cache considerations

GitHub Pages/CDN may cache files briefly. Because the project does not use fingerprinted asset names, use a hard refresh after publishing when validating a change. For a larger application, adopt a build pipeline that emits content-hashed assets.

## Rollback

Revert the problematic commit on the publishing branch. GitHub Pages will deploy the restored static files automatically.

## Custom domain

If a custom domain is introduced, add a `CNAME` file, update `canonical`, Open Graph URL, sitemap URL, and web-manifest `start_url`, then enforce HTTPS in Pages settings.
