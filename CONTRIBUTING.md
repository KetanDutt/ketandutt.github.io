# Contributing

Thanks for helping improve this portfolio.

## Workflow

1. Keep changes focused and avoid introducing dependencies unless they solve a documented need.
2. Update structured content in `config.json`; keep stable, crawlable biography/contact content in `index.html`.
3. Run `npm test` before submitting a change.
4. Serve the site locally with `npm run dev` and review desktop/mobile widths, both themes, keyboard interaction, and reduced motion.
5. Describe user-facing changes and include screenshots for visual changes in a pull request.

## Style conventions

- Use semantic HTML and native controls before custom widgets.
- Use design tokens from `:root` rather than repeating colors and radii.
- Insert config values through DOM APIs and `textContent`; do not inject them as HTML.
- Add accessible names to icon-only controls and links.
- Keep animations transform/opacity based and provide a reduced-motion result.
- Never add credentials, analytics identifiers, or private personal data.

## Content standards

Keep claims concise, current, and verifiable. Test every demo and repository URL. See [docs/CONTENT.md](docs/CONTENT.md) and [docs/QUALITY.md](docs/QUALITY.md).
