# LeadbasePro Design System

Frozen visual contract for the LeadbasePro app.

- `tokens.css` — all `--lb-*` design tokens (colors, type, radii, shadows, gradients, dark theme).
- `components.css` — all `lb-*` component classes. Emitted by thin React wrappers only.
- `examples.html` — rendered reference for every scene; open in a browser. If a built screen matches this file, it is visually correct.

Rules: never edit tokens.css/components.css to fix a single screen; never add `!important`;
new primitives go below the ADDITIONS divider only. See AGENTS.md at repo root.
