# Content maintenance

Most portfolio updates only require editing `config.json`.

## Projects

A project has the following shape:

```json
{
  "title": "Project name",
  "description": "One concise outcome-focused sentence.",
  "category": "Games",
  "technologies": ["Unity", "C#"],
  "demo": "https://example.com/optional-demo",
  "source": "https://github.com/KetanDutt/repository",
  "updated": "2026",
  "color": "#7c69ff",
  "image": "assets/projects/example.jpg",
  "featured": false
}
```

`source` is required. `demo` is optional and should be omitted when no working public experience exists. Categories automatically become filter buttons. Keep category names consistent.

`image` is optional; when present it renders as cinematic cover art on the project card and inside the glass modal. When omitted, the card falls back to a subtle tinted glass surface using `color`. `featured` (boolean) gives a project the large, full-width treatment at the top of the grid — use it sparingly, ideally for one standout project at a time.

## GitHub profile details

`github.recentRepositories` powers the dedicated GitHub bento section. Keep this list to a small set of genuinely recent public repositories. Each entry accepts `name`, `description`, `language`, `updated`, `url`, and an optional `demo`.

The live public-repository count is requested from GitHub’s public user API and updates both the hero and GitHub profile card. The configured `profile.publicRepos` value remains the resilient fallback.

## Experience

Experience entries are displayed in file order, newest first. Use compact date ranges and summarize responsibilities and evidence in one paragraph. Avoid unverifiable metrics.

## Profile and focus

- `profile.publicRepos` is the fallback shown when GitHub’s API is unavailable. Update it periodically.
- `profile.skills` renders the toolbox pills. Each entry has `name`, `group`, and an optional `note` shown on hover/focus.
- `profile.specialties` is a flat list of short strings rendered as a compact chip row beneath the toolbox (e.g. monetization, CI/CD, analytics).
- `focus` should represent current work, learning, and collaboration interests.

## Education, certifications, and awards

- `education` renders in the “Foundations” section, left column. Each entry: `{ "period", "credential", "school" }`.
- `certifications` renders in the same section, right column. Each entry: `{ "period", "title", "issuer" }`. Use this for external training/courses/internships, not formal degrees.
- `awards` powers the “Recognition” grid. Each entry: `{ "period", "title", "issuer", "description" }`. Keep descriptions to one sentence, and only include awards that are verifiable from the résumé or public record.
- `maker` is an optional list of early/personal projects that don’t have a full project card (no live demo, or predate the developer’s GitHub usage). Each entry: `{ "title", "year", "description" }` with an optional `url` if a repository exists. Rendered in the “Before the games” section as lightweight cards, separate from the main `projects` grid.

## Verification checklist

Before publishing:

1. Run `npm test`.
2. Open every changed source/demo URL.
3. Check text at 320 px, 768 px, and desktop widths.
4. Check both color themes.
5. Navigate all controls using only Tab, Shift+Tab, Enter, Space, and Escape.
6. Confirm claims against the public repository or résumé.
7. Update the reconciliation date in `README.md` after a substantial GitHub-profile refresh.

## Public data source

Repository details in this site were reconciled with <https://github.com/KetanDutt>. The browser only requests the public GitHub user endpoint to refresh the repository count; private data and credentials are never requested.
