# Ketan Dutt — Portfolio

A fast, accessible, data-driven portfolio for [Ketan Dutt](https://github.com/KetanDutt), game developer and software engineer. The site uses a restrained spatial interface with translucent materials, a system sans-serif typeface, and project artwork as the primary visual focus, while remaining lightweight and usable without a framework.

**Live site:** [ketandutt.github.io](https://ketandutt.github.io/)

## Highlights

- Dark and light palettes with centralized glass, color, spacing, geometry, and motion tokens
- Spacious hero with a portrait, concise career highlights, and a static list of tools
- Editorial "Selected work" layout with cinematic artwork, responsive mixed-size cards, polished loading and empty states, and a floating project dialog
- Filterable and searchable project gallery with a live result count and one-click filter reset
- Floating glass navigation with a gliding active state, scroll progress, and a mobile navigation sheet
- GitHub profile section with statistics, recent repositories, and live demos
- Progressive GitHub repository-count refresh with caching and a static fallback
- Experience timeline with career details and areas of focus
- First-class dark and light palettes, a matching 404 view, and motion that respects `prefers-reduced-motion`
- Semantic HTML, keyboard navigation, focus-trapped overlays, skip link, visible focus styles, and meaningful labels
- Open Graph metadata, canonical URL, JSON-LD structured data, sitemap, robots rules, and web manifest
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

The test suite validates JavaScript syntax, required files, portfolio data, internal references, document structure, the design-token contract, and key accessibility/SEO hooks. There are no packages to install.

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
├── assets/projects/        # Cinematic project artwork used by the work section
├── docs/                   # Architecture, content, deployment, and QA guides
└── tests/smoke.mjs         # Dependency-free production checks
```

## Updating content

Edit `config.json`. Each project supports:

- `title`, `description`, `category`, and `technologies`
- `source` (required) and `demo` (optional)
- `updated` display year and `color` accent
- `image` (optional path under `assets/projects/`) for the cinematic card artwork
- `featured` (optional boolean) to give a project the large, full-width treatment

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

## Design attribution

The editorial refinement adapts principles from [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky (@heydamir), licensed under CC BY 4.0.

## License

Copyright © Ketan Dutt. Portfolio content, personal information, and visual assets are not licensed for reuse. Referenced projects retain the licenses declared in their respective repositories.
