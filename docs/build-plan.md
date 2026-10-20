# Build plan: portfolio (Astro, static)

> Superseded on 20 Oct 2026 by the blue glass redesign: see `glass-redesign-plan.md`. Kept for the v1 decisions and review log.

Source of truth: the Design canvas comp (`Main.dc.html`, 1440 wide) plus the handoff notes.

## Stack
- Astro 7.4 `output: 'static'`, `@astrojs/react` for TSX components rendered at build only (no `client:*` anywhere), Tailwind 4 through `@tailwindcss/vite`.
- Fonts: Astro Fonts API, Google provider, self-hosted at build. Barlow 400/500/600, Barlow Condensed 500/600/700, JetBrains Mono 400/500. Latin subset covers á and í.
- Motion: the comp's CSS is the baseline (`@starting-style` entrance, `view()` timeline rise and word scrub, sticky column, accordion `flex-grow`). GSAP ScrollTrigger is dynamically imported from `index.astro` only when `animation-timeline` is unsupported (Firefox) and drives the word scrub and card rise there. The pinned column is `position: sticky`, which Firefox supports, so no GSAP pin.

## Files
- `astro.config.mjs`: fonts.
- `src/layouts/Base.astro`: head, `<Font>` tags, global.css.
- `src/pages/index.astro`: composes sections, holds the GSAP fallback script.
- `src/styles/global.css`: `@theme` tokens, component classes, motion rules.
- `src/data/site.ts` (name, email, links), `projects.ts`, `capabilities.ts`, `employers.ts`.
- `src/components/`: Nav, Hero, EmployerStrip, WorkSection, ProjectCard, Manifesto, Accordion, Contact (`.tsx`).
- `src/components/diagram/`: `Diagram.tsx`, `types.ts`, `torquePath.ts`, `milestones.ts`, `reviewGate.ts`, `rings.ts`.

## Diagram
One data-driven `Diagram` renders a single SVG whose `viewBox` is the comp's coordinate space: regions (panels, rings), nodes (rect or circle, explicit text lines), edges (polylines with optional arrowhead, dashed, accent) and free labels. Width 100% so the whole host scales. Optional `minScale` floor (scrolls past it) for the 760-wide card diagrams so text stays at or above 9 px on phones. Default 0 is pure scaling.

## Content decisions
- Placeholders kept where the handoff has them: email, LinkedIn, GitHub and the three repository URLs, centralised in `site.ts` and `projects.ts`.
- EPAM stays in the employer strip as in the comp. Removal is one line in `employers.ts` if the stealth-search rule applies.
- RS50 milestone status is kept as of 17 Sep 2026. Refresh before publishing.

## Verify
`astro build`, `astro check`, no `astro-island` in `dist/`, fonts served from `/_astro/`, HTML smoke test (sections present, three `mailto:` links), then two fresh-context reviews.

## Deploy
Set up in parallel on 20 Oct 2026, outside this build: OpenTofu in `infra/` (private S3 bucket, CloudFront, ACM, Cloudflare DNS, GitHub OIDC role) and GitHub Actions in `.github/workflows/` (CI on pull requests, deploy on push to `main`, which runs `npm run build`). `site` is https://sebastiansuarez.dev. Those files are not touched by this plan.

## Review log

Plan attack (Codex adversarial review, 20 Oct 2026), five findings:

- Accepted: verify every requested font, not just asset paths. The browser audit now checks `document.fonts` for each family and weight; the unused Barlow Condensed 500 was dropped from the config.
- Accepted: diagrams need a text alternative and a readable phone size. Each dataset carries a `description` rendered as the SVG `<desc>` and wired through `aria-describedby`; the hero got a 0.58 floor, the cards keep 0.6.
- Accepted: placeholder links must not pass a release check. `npm run check:release` scans `dist/index.html` and exits 1 while the email, LinkedIn or GitHub placeholders remain.
- Rejected: both motion engines must honour reduced motion. Already the case: the CSS rules sit under `prefers-reduced-motion: no-preference` and the GSAP fallback returns before importing anything when the preference is set. Verified with media emulation.
- Rejected: CSS animations and GSAP could compete. Already exclusive: the view-timeline rules live inside `@supports (animation-timeline: view())` and GSAP loads only when that same check fails. Verified by forcing the check off.

Build finding: Vite 8 minifies CSS with Lightning CSS, which folds `animation-timeline` into the `animation` shorthand; browsers reject that and drop the rule. CSS minification is off (`cssMinify: false`), costing about 6 KB on a 21 KB stylesheet.

Implementation round 1 (Codex adversarial review, 20 Oct 2026), three findings, all accepted:

- Scrollable diagram hosts were not keyboard-reachable in Safari. Hosts with a scale floor now carry `tabindex="0"` and the diagram's name and description; the SVG keeps them otherwise.
- Accordion chips were unreachable on touch devices at or above 900 px, because a tap does not focus a button in Safari. Under `(hover: none)` the chips are always visible.
- The GSAP card rise spanned 70% of the viewport height, while CSS `entry 0% → 70%` spans 0.7 × min(card height, viewport height). The fallback now computes that distance per card at refresh time. This replaces the handoff's `end: "top 30%"` mapping.

Lighthouse (20 Oct 2026, local build, cached Chrome for Testing): mobile 95 / 96 / 100 / 100, desktop 100 / 96 / 100 / 100 for performance / accessibility / best practices / SEO. CLS 0 on both. The accessibility deduction is the colour-contrast audit reading the start state of the scroll-driven reveals (cards at 0.25, words at 0.18 opacity) below the fold at load; the visible end state passes.

Implementation round 1 (fresh-context Claude review, 20 Oct 2026), eleven findings:

- Accepted: the accent focus ring vanished on the accent contact block. `#contact :focus-visible` now uses the ink-on-tan colour.
- Accepted: the "Infrastructure, interfaces" label straddled the outer ring's outline (same as the comp). Moved from y 30 to y 40.
- Accepted: "imported from CLAUDE.md" touched both edges of its box. The AGENTS.md node is 200 wide, edge to Antigravity starts at its new right edge.
- Accepted: boxes on the viewBox edge lost half their stroke. The viewBox is inset by one unit.
- Accepted: the sticky nav grew to 140 px on 360 px phones. The nav CTA is hidden below 400 px; the hero CTA sits directly under it.
- Accepted: four permanent tab stops at desktop widths, and card diagrams one-third hidden on phones with no cue. A small script keeps `tabindex` and a "scroll sideways" hint only while a host overflows; the no-script default stays focusable.
- Accepted: the accordion button had no activation effect. A small script toggles `aria-expanded` and `data-state`; hover and focus still preview through CSS; on touch and narrow layouts the buttons start expanded.
- Accepted: the favicon relied on a web font. It is now a drawn path.
- Accepted: `@types/react` and `@types/react-dom` moved to devDependencies; `playwright-core` is removed after the final audit.
- Rejected: a 220 KB React client chunk is emitted. Astro 7 adds every renderer's client entry to the bundle unconditionally; nothing references it and the page never loads it. Left as dead weight in `dist/`.
- Rejected: wire `check:release` as `postbuild`. The deploy workflow runs `npm run build`, so this would fail every deploy until the slots are filled, including the parallel pipeline's first runs. It stays a separate step to chain into the deploy job once the URLs are real.

Verification after round 1 (Chromium, cached Chrome for Testing): 18 tab stops at 1440 with no idle diagram stops; contact focus ring ink-on-tan; accordion click opens one pane and sets `aria-expanded`, tap on touch collapses chips; scroll hint shows on 3 of 4 diagrams at 390 px and all 4 at 360 and 320; nav 73 px at every width; no page errors; no horizontal overflow. Both review rounds are closed; remaining items are the open content slots and the deploy pipeline's first run.
