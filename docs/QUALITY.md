# Accessibility and quality

## Accessibility features

- Semantic landmarks and ordered heading hierarchy
- Skip link to bypass repeated navigation
- Keyboard-operable menu, filters, theme control, and links
- Escape closes mobile navigation
- Visible `:focus-visible` treatment
- Text alternatives and descriptive accessible names
- Status changes announced through the project grid’s live region
- Dark and light palettes with high-contrast primary text
- `prefers-reduced-motion` support
- Decorative visual layers hidden from assistive technology
- No information communicated by color alone

## Manual accessibility checks

Automated checks cannot replace manual review. Before a release:

1. Zoom to 200% and ensure no content is lost.
2. Test keyboard order and visible focus.
3. Enable reduced motion at the OS level.
4. Check a screen reader’s landmark and heading navigation.
5. Verify text and UI contrast if palette tokens change.
6. Confirm touch targets remain at least approximately 44×44 px.

## Reliability

The page’s essential introduction and contact links are static. Dynamic content has a clear error fallback. GitHub enrichment is non-critical, rate-limit tolerant, cached, and time bounded. Local storage access is guarded for privacy modes where it may throw.

## Security notes

External links use `rel="noopener noreferrer"`. Dynamic portfolio fields are inserted with DOM `textContent`, minimizing injection risk. No secrets or API credentials belong in this client-side repository. See `SECURITY.md` for reporting.

## Suggested future improvements

- Add an optimized local portrait (AVIF/WebP with fallback) to remove the remaining external hero-image dependency.
- Add Playwright visual and keyboard regression checks if a CI/build dependency budget becomes acceptable.
- Add project screenshots only when they can be consistently optimized and kept current.
- Introduce content-hashed assets and immutable caching if the project moves to a build pipeline.
- Consider privacy-friendly analytics only with a defined purpose and consent strategy.
