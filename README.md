# Ketan Dutt — Portfolio

A fast, accessible, data-driven portfolio for [Ketan Dutt](https://github.com/KetanDutt), game developer and software engineer. The site uses a modern glass interface inspired by Apple’s visual language while remaining lightweight and usable without a framework.

**Live site:** [ketandutt.github.io](https://ketandutt.github.io/)

## Highlights

- Responsive glass UI with dark and light themes
- Motion that respects `prefers-reduced-motion`
- Filterable and searchable project gallery
- Dedicated GitHub profile bento with recent repositories and live demos
- Progressive GitHub repository-count refresh with caching and a static fallback
- Semantic HTML, keyboard navigation, skip link, visible focus styles, and meaningful labels
- Open Graph metadata, canonical URL, sitemap, robots rules, and web manifest
- No runtime framework or package dependencies
- Content separated into `config.json` for straightforward maintenance

## Run locally

The site fetches `config.json`, so serve it over HTTP rather than opening `index.html` directly.

```bash
npm run dev
# Open http://localhost:4173
```

Any static server works, for example `python3 -m http.server 4173`.

## Validate

```bash
npm test
```

The test suite validates JavaScript syntax, required files, portfolio data, internal references, and key accessibility/SEO hooks. There are no packages to install.

## Project structure

```text
.
├── index.html              # Semantic page structure and SEO metadata
├── styles.css              # Design system, layout, animation, responsive states
├── script.js               # Rendering, themes, filtering, navigation, GitHub enhancement
├── config.json             # Projects, experience, skills, and current focus
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── 404.html
├── Ketan_Dutt_CV.pdf       # Downloadable résumé
├── docs/                   # Architecture, content, deployment, and QA guides
└── tests/smoke.mjs         # Dependency-free production checks
```

## Updating content

Edit `config.json`. Each project supports:

- `title`, `description`, `category`, and `technologies`
- `source` (required) and `demo` (optional)
- `updated` display year and `color` accent

See [docs/CONTENT.md](docs/CONTENT.md) for the full workflow. Details were reconciled with the public [KetanDutt GitHub profile](https://github.com/KetanDutt) on September 7, 2026.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Content maintenance](docs/CONTENT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Accessibility and QA](docs/QUALITY.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Deployment

The repository is designed for GitHub Pages and requires no build step. Push changes to the publishing branch and GitHub Pages serves the root directory. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for setup and release checks.

## License

Copyright © Ketan Dutt. Portfolio content, personal information, and visual assets are not licensed for reuse. Referenced projects retain the licenses declared in their respective repositories.
