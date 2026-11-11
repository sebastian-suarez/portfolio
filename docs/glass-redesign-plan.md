# Plan: blue glass redesign

Task (owner, 20 Oct 2026): use the new design (`~/Downloads/Sebastian-Suarez-Portfolio.zip`), keep the current site's concept (sections, diagrams, projects, motion), restyle it in the new blue glassmorphism, and add the CV (`Sebastian_Suarez_Resume.pdf`).

Owner decisions so far: hero keeps the current title ("Backend lead and architect"), EPAM is shown, no phone number on the site.

## Visual system (from the new design)
- Light blue canvas `#e8f1fa`, blurred "light field" rings behind the glass, frosted white panels (backdrop blur 15–28 px, 1 px white border, inset highlight, soft shadow). Ink `#233047`, muted `#45546c`, accent `#3a4b75`, plus a brighter blue for diagram strokes.
- System font stack, as in the design. Drops Barlow, Barlow Condensed, JetBrains Mono and the Fonts API config.
- The design's fallbacks stay: no `backdrop-filter` or `prefers-reduced-transparency` → solid panels; reduced motion → no animation. Light only, as designed.

## Page, top to bottom
1. **Header** (new): glass "ss" tile, name, "Backend lead and architect", glass pill nav (Work, Projects, Experience, Contact), "Read résumé ↗".
2. **Hero** (current): headline, copy, Email me / See the work, torque-path diagram on a glass panel.
3. **Shipped for** (current): employer plates as glass pills.
4. **Client work** `#work` (new): the design's side tab list + glass stage with its three CV projects (Limber Health PDFs, Intive CMS, SunDevs fitness). Added: one diagram per panel, built only from CV facts. Limber: before/after bars (about 6 s vs 10–20 ms). Intive: CMS → fetch service → transform service → mobile apps, payload −10%. SunDevs: Stripe checkout → webhooks → Node.js backend → app access.
5. **Own projects** `#projects` (current): sticky intro column + three glass cards with the RS50, VSebCode and Clean Architecture diagrams. Repo links go to the public `VSebCode` and `Clean-architecture-template` repos; RS50 has no public repo, so its link is hidden.
6. **How I work** (current): manifesto word scrub.
7. **What I bring to a team** (current accordion, glass panes), merged with the CV skills: Backend, Frontend & mobile, Data & cloud, Delivery, Hardware, Agent tooling.
8. **Experience** `#experience` (new): glass list of all ten CV roles, expandable, with the overlap note.
9. **Background** (new): CV summary, education, languages. Skills live in the accordion only, so they are not listed twice.
10. **Contact** `#contact`: current headline and copy, the design's large email link, GitHub and LinkedIn, footer.
11. **`/resume/`** (new): the design's HTML résumé with print styles and the CV title "Senior Software Engineer | Backend & Full Stack". No phone and no PDF download (the PDF carries the phone number).

## Motion
- Kept: hero entrance (`@starting-style`), card rise (view timeline, GSAP fallback in Firefox), manifesto word scrub, sticky column, accordion.
- From the design: tab crossfade (280 ms) with hash and back-button support, ported from `folio.js` without its three-tab hardcode. Without JS all panels show stacked.
- New, for the diagrams: when a diagram enters view, nodes fade up in order and edges draw from source to arrowhead (IntersectionObserver adds a class, CSS does the rest; arrowheads become their own paths so they appear when the line arrives). Accent edges carry a slow travelling pulse. Limber's bars grow from zero. All of it is off under reduced motion, and the static end state is what renders without JS.

## Content and code
- `site.ts`: email, GitHub and LinkedIn from the CV, which clears the release-check placeholders.
- New `src/data/cv.ts` from the design's `content.json`, checked line by line against the PDF.
- Astro 7 static, build-time TSX, Tailwind 4 kept. `global.css` component classes rewritten from `folio.css`. Diagram regions move from hard-coded dark colours to tones.
- New: Header, ClientWork, Experience, Background, Footer components, three diagram datasets, `src/pages/resume.astro`, `src/scripts/project-tabs.ts`, `src/scripts/diagram-reveal.ts`. Nav.tsx is replaced by Header.
- Single attempt (no acceptance suite, so no rival draft).

## Not doing
Career timeline chart (the CV gives Intive no end date), dark mode, PDF download.

## Verify
`astro check`, `astro build`, `check:release`, screenshots at 1440 / 390 / 360, tab switching by mouse, keyboard and back button, reduced motion and no-JS renders, the GSAP path with `view()` forced off, Lighthouse. Then one review round on the working result: a fresh-context review of the artifact alone, and an adversarial review with the task.

## Review log

Plan attack (adversarial review, 20 Oct 2026), three findings, all accepted:

- Tab switches change the page height and unhide diagrams, but the diagram-overflow helper and the GSAP fallback only re-measure on resize. Accepted: every tab change (click, hash, back button) fires one layout-change event; the overflow helper re-measures and the GSAP fallback calls `ScrollTrigger.refresh()`. Test: switch between panels of different heights, then keyboard-scroll a diagram that was hidden.
- The manifesto scrub starts words at 0.18 opacity, about 1.4:1 contrast on the light canvas, and readers can stop scrolling mid-way. Accepted: the scrub animates colour from `#7d8aa3` (3:1 on the canvas, enough for text this size) to ink, never opacity, in both the CSS and the GSAP path.
- The design's `resume.html` uses relative links (`index.html`, `resume.css`), which break under `/resume/`, and CloudFront serves `/resume` without a slash by rewriting, not redirecting. Accepted: root-absolute links only (`/`, `/resume/`), styles through Astro. Test: `/resume` and `/resume/` both load styles and both return links work.

Build finding: on phones the client-work layout switched from grid to flex but kept the grid's `align-items: start`, so the stage grew to its widest diagram (536 px on a 390 px screen) instead of scrolling the diagram. Fixed with `align-items: stretch` and `width: 100%` below 700 px. The old "no horizontal scroll" check missed it because `html` clips overflow; the check now measures every element.

Implementation round 1 (adversarial review with the task, 20 Oct 2026), two findings, both accepted after reproducing them with print emulation:

- Printing dropped the two inactive client projects: Tailwind's `[hidden] { display: none !important }` lives in `@layer base`, and a layered `!important` beats the unlayered print override. The override now sits in `@layer base`.
- Printing left unvisited diagrams in their hidden entrance state. Entrance states and the scroll-driven card rise and word scrub are now `screen` only, and print turns off transitions and animations and resets the GSAP fallback's inline start styles. Found alongside it: the cards printed at 25% opacity. Fixed by the same change.

Implementation round 1 (fresh-context review, 20 Oct 2026). The first reviewer was unavailable, so the stand-in ran at its highest effort. Three findings, all accepted and covered by new checks:

- Back did not restore the tab when the earlier history entry had a non-project hash (load `/#projects`, pick Intive, press Back). Each entry now records its tab in history state before a new one is pushed.
- Between 701 and 1000 px the heading line break is hidden with no space left, giving "Training PDFs.A shorter wait." A space now precedes each `<br>`.
- Pulses stayed paused after reduced motion was switched off. The reveal script tracks which diagrams are on screen and resumes them.

Verified after fixes: `astro check` clean, build green, `check:release` passes, 30 browser checks pass (tabs by mouse, keyboard, Back/Forward and deep link; reveal and pulse states; phone overflow; reduced motion; no JS; GSAP path; `/resume` and `/resume/`), print emulation shows all projects and diagrams. Lighthouse (final local build): 100 / 100 / 100 / 100 on mobile and desktop, CLS 0; `/resume/` accessibility and SEO 100.

## Follow-up: 404 page (20 Oct 2026)

`src/pages/404.astro` builds `dist/404.html`, which CloudFront already serves (status 404) for any missing path, since S3 answers 403 for a missing key and `infra/cloudfront.tf` maps 403 and 404 to it. Before this, `/404.html` did not exist, so missing paths returned S3's 403 XML. The page is `noindex`, uses root-absolute links only (the header takes `base="/"` so its section links become `/#work` and so on), and carries a small diagram of the request path. `.page` now has `overflow: clip`, so the light field no longer adds empty scroll below short pages; the sticky column still works.

Verified: built page at `/nope`, `/404` and a nested path returns 404, styled, with working links; no overflow at 1440 / 900 / 700 / 390 / 360 px (a grid column needed `minmax(0, 1fr)` on phones); focus ring on every tab stop; print shows the finished page; the 30 home-page checks still pass. Reviews: the adversarial review approved with no findings, and the fresh-context review found nothing. It could not launch a browser in its sandbox, so the layout, keyboard and print checks above were run separately.
