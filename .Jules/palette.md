## 2026-02-07 - Dynamic Config A11y
**Learning:** This app generates icon-only buttons from JSON data (`config.json`) which lacks text labels, causing screen reader issues.
**Action:** When working with `config.json` powered sites, proactively add `name` or `aria_label` fields to the JSON schema to support accessible rendering.
