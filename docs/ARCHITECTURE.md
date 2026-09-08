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
6. Intersection observers reveal content on demand; a lightweight passive scroll state updates the navigation indicator, material strength, and progress line.

## Design system

`styles.css` implements a restrained, dark-first "Liquid Glass" design system. Tokens in `:root` define four material strengths (primary, secondary, tinted, and floating), semantic typography colors, blur levels, ambient shadows, geometry, spacing, animation timing, easing, and spatial z-index layers. Reusable primitives (`.glass`, `.pill`, `.button`, `.filter-button`, `.skill-pill`) combine translucency, controlled saturation, an internal edge highlight, and soft depth. Glass is reserved for navigation, floating controls, dialogs, and hierarchy-bearing surfaces; editorial content remains directly on the canvas. Light mode has its own material values rather than an inverted palette. Solid fallbacks cover browsers without backdrop filtering, while `prefers-reduced-motion` removes non-essential transforms, continuous movement, and smooth scrolling.

## Performance decisions

- No CSS/JavaScript framework, icon font, chart library, particle library, or alert library.
- System font stack avoids font downloads and layout shift.
- The portrait is explicitly sized and requested at an appropriate source resolution.
- Animation uses transforms and opacity; reduced-motion users receive near-static presentation.
- GitHub data is optional, cached, and bounded by an abort timeout.
- All project interaction is performed against already-loaded local JSON.

## Browser support

Current evergreen versions of Chrome, Edge, Firefox, and Safari are targeted. Core content remains available when backdrop blur or IntersectionObserver is unsupported.
