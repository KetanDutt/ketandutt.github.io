# Architecture

## Overview

This is a no-build static site optimized for GitHub Pages. Keeping the rendering stack to HTML, CSS, and browser JavaScript reduces dependency risk, deployment complexity, and transferred code.

## Responsibilities

- **`index.html`** contains semantic, crawlable core content, metadata, navigation, and section mounting points.
- **`config.json`** is the structured content source for projects, experience, skills, and focus areas.
- **`script.js`** progressively renders structured content and adds interaction. If live GitHub data is unavailable, static values remain usable.
- **`styles.css`** provides tokens, glass primitives, responsive layout, and motion preferences.

## Runtime flow

1. Static HTML and CSS render the hero and core navigation immediately.
2. JavaScript restores the visitor’s theme, enables mobile navigation, and loads `config.json`.
3. Projects, experience, and skills are rendered using DOM APIs and `textContent` rather than interpolated HTML.
4. Project filters/search update the local view without additional network calls.
5. A non-blocking GitHub API request refreshes the public repository count. The response is cached for one hour and times out after 3.5 seconds.
6. Intersection observers reveal content and highlight navigation without scroll-event listeners.

## Design system

`styles.css` implements a restrained, dark-first "Liquid Glass" design system. Tokens in `:root` define surfaces, typography colors, a sparingly used accent, glass material variables, radii, blur levels, and motion easing/duration. Reusable primitives (`.glass`, `.pill`, `.button`, `.filter-button`, `.skill-pill`) combine a translucent surface, subtle inner highlight, border, soft layered shadow, and backdrop blur — glass is applied selectively to navigation, floating controls, and important cards, while large text and body content sit directly on the background. A solid fallback is supplied for browsers without backdrop-filter, and all decorative motion is disabled under `prefers-reduced-motion`.

## Performance decisions

- No CSS/JavaScript framework, icon font, chart library, particle library, or alert library.
- System font stack avoids font downloads and layout shift.
- The portrait is explicitly sized and requested at an appropriate source resolution.
- Animation uses transforms and opacity; reduced-motion users receive near-static presentation.
- GitHub data is optional, cached, and bounded by an abort timeout.
- All project interaction is performed against already-loaded local JSON.

## Browser support

Current evergreen versions of Chrome, Edge, Firefox, and Safari are targeted. Core content remains available when backdrop blur or IntersectionObserver is unsupported.
