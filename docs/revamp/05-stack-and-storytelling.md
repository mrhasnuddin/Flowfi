# 05 · Stack check, storytelling and motion review

> Superseded in part by [08 · Rebuild to taiko.xyz's structure and motion](08-taiko-replication.md): type, button colour, section structure and motion values there are current.

Built 2026-10-21. Reads with [01](01-taiko-teardown-and-comparison.md) (how Taiko works) and [03](03-design-system.md) (tokens).

## 1. Can FlowFi's stack reach Taiko's level?

**Yes. Nothing Taiko does depends on Next.js.** Its signature effects are client-side GSAP, a 2D canvas and CSS. FlowFi was Vite + vanilla JS, which runs all of that unchanged. Two things in the old setup did block it.

| Layer | Taiko | FlowFi before | Verdict | FlowFi now |
|---|---|---|---|---|
| Build / framework | Next.js App Router | Vite 7, vanilla JS | Fine. A static one-page site gains nothing from SSR or routing | Vite 7, vanilla JS |
| Scroll engine | GSAP + ScrollTrigger (`.pin-spacer`) | None (IntersectionObserver fades) | **Missing** | `gsap` 3.15 with ScrollTrigger, ~53 KB gzipped for all JS |
| Styling | CSS Modules, hard-coded values | **Tailwind from the CDN** | **Blocker.** The CDN script is a runtime compiler: slow, flashes unstyled, not meant for production | Plain CSS on three-tier tokens (`src/tokens.css`), 6.8 KB gzipped |
| Pixel rain | `<canvas>` 2D | Canvas attempt in the old tree | Fine | `src/rain.js`, 90 lines, stops off-screen |
| 3D / WebGL | Pre-rendered 3D mark (WebP) | `three` (~600 KB) for a tilting logo | Overkill | Removed. The 3D mark is a WebP with a CSS tilt |
| i18n | none | EN / CN | FlowFi is ahead | EN / CN, CJK type rules, `<html lang>` follows |
| Reduced motion | none in CSS | none | Must add | Pins and scrubs never start; layout stacks |

### If you want something other than GSAP

| Option | What you get | Cost | Recommendation |
|---|---|---|---|
| **GSAP + ScrollTrigger** (chosen) | Identical mechanics to Taiko: pin, scrub, `containerAnimation` for the sideways travel, `matchMedia` for the fallbacks | 53 KB gz total | Use it. Resize, font-load and breakpoint handling are the hard part and it already does them |
| Sticky + a small scroll handler | ~90% of the look, no dependency, about 40 lines | You own resize, refresh and the horizontal timing maths | Fine if the bundle must stay under 20 KB |
| CSS scroll-driven animations (`animation-timeline`) | The cheapest option, runs on the compositor | No pinning of the horizontal travel in every browser, Firefox support is partial | Good for reveals later, not for the pin |
| Move to Next.js | Nothing visual | Rewrite, hydration, i18n routing | Only if you later want `/zh` as a real route |

## 2. Storytelling: Taiko's beats mapped to FlowFi's content

Taiko's order is hero → sideways scroller → mark morph → statement → dark roadmap → governance → footer. FlowFi's original order was problem → vaults → economics → roadmap → call to action. They line up, with the problem folded into the scroller so the pinned section comes straight after the hero, as you asked.

| # | Taiko beat | FlowFi beat | Why this content goes here |
|---|---|---|---|
| 1 | Hero, 3D mark in a blueprint frame | Hero: "FlowFi is Capital, Governed.", 3D mark, partners, audit badges | Same composition. Proof sits right under the claim |
| 2 | **Pinned scroller.** "Taiko is based", then 1 DAO, 1 Token, 1 Community | **Pinned scroller.** The problem statement, then **1 Governance Treasury**, **1 Investor Treasury**, **1 FF Token** | Three nouns that are all in the original copy, each with its real number (1.2B FF, $10M+, 1B FF). The problem is the first screen, so the "why" arrives before the "what" |
| 3 | Mark outline fills in | **Pinned mark morph.** The FlowFi mark fills from the bottom, then the two vaults appear either side | The original page already put the mark between "Governance" and "Investor" labels. The morph is how the two halves join |
| 4 | Letter-by-letter statement | One sentence reveals letter by letter: the Black Hole Launch description, above four cards | Taiko reveals its mission line. FlowFi has no mission line, and inventing one was off the table, so the token-model sentence takes the slot |
| 5 | Dark roadmap | One ink band: Phase 01–03 | The single dark moment (D1). No dates, as in the original |
| 6 | Governance + community | FAQ, then "Are you a governance architect…" with three audience tiles | Taiko ends on community. FlowFi's original ended on three audiences, which is the better exit for a finance product |
| 7 | Footer | Footer, four original columns, "Soon" chips where no URL exists | Nothing points at `#` |

### The scroller, exactly

- Section is pinned for `0.85 × (3 screen widths)` of scroll. Travel is slightly faster than scroll, so the pin never feels long. Taiko's ratio is about 0.75.
- Four screens, each 100vw. Content sits in the lower half, ribbons and rain in the upper half, so type never crosses a ribbon.
- Ribbons are SVG strokes drawn on with `stroke-dashoffset`, scrubbed by horizontal position (`containerAnimation`). Colours are purple, lavender and gold only (D3).
- A blueprint layer (circles, crosshair lines) travels at 0.7× for depth.
- Below 768px, or with reduced motion, there is no pin: screens stack, ribbons and circles are hidden, the rain stays.

### Pixel rain

Same idea as Taiko's canvas: short vertical trails of square pixels in cell-aligned columns, upper ~60% of the scene, fading toward the bottom.

| Property | Value |
|---|---|
| Cell / pixel | 14px grid, 5px squares |
| Trail | 3 to 7 squares, alpha from 1 at the head to 0.25 at the tail |
| Speed | 38 to 108 px/s per drop |
| Density | width ÷ 120 drops (12 at 1440, 3 at 390) |
| Colours | purple-500 (4), lavender-300 (3), gold-500 (1.5), neutral-300 (2), by weight |
| Canvas | opacity 0.8, masked to fade out at the bottom |
| Runs when | the canvas is on screen **and** the tab is visible **and** motion is allowed. Otherwise one still frame |

## 3. Motion review (emil-design-eng, motion-performance, accessibility)

Findings from my own build, fixed before this write-up.

| Before | After | Why |
|---|---|---|
| Taiko's arrow slide has a 0.1s delay | 220ms, no delay, `ease-out` | The delay reads as lag. Emil: the first movement is the moment users watch |
| Hover styles on every device | Wrapped in `@media (hover: hover)` | Touch screens left buttons stuck in hover after a tap |
| First screen reveal waited for the pin to start | Reveals when the section scrolls into view | The scroller arrived with no text for about 60px of scroll |
| Ribbons crossed the screen titles | Paths moved right and up; ribbon layer capped at the top 72% | Type over a 22px purple stroke was hard to read at 1024×768 |
| Outline of the mark drawn inside the shape | Drawn outside (`dilate`), faded out when the fill completes | The inner outline showed as a dotted edge around the filled mark |
| Architecture pinned at every width ≥768 | Pinned from 1100px; stacked below | Two text columns plus the mark are taller than one 768px screen |
| Focus on a button in an off-screen screen did nothing | `focusin` scrolls to that screen | Keyboard users tabbed into content they could not see (tested: lands at left 115px, visible) |
| Rain moving at all times | Stops when off-screen, hidden, or reduced motion | Motion-performance: no loop without a stop condition |

Kept on purpose: custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for CSS, `power3.out` (nearest GSAP equivalent) for scripted reveals; press scale 0.97; no `transition: all`; no overshoot; durations 100 to 320ms; one scrubbed sequence per pin; opacity and transform for everything except the stroke draw and the small `clip-path` on the mark.

## 4. What was measured

| Check | Result |
|---|---|
| Build | 134 KB JS (53 KB gzip), 30 KB CSS (6.8 KB gzip), HTML 6.4 KB gzip |
| Frame times while scrolling through both pins (headless Chrome, software rendering) | median 6.1ms, p95 24ms, 12 of 239 frames over 20ms, one 267ms outlier. **Not a real-GPU number** |
| Console errors at 1440, 1024, 768, 390, Chinese, reduced motion | 0 |
| Horizontal overflow at the same sizes | none |
| Token contrast | 35 pairs pass (`npm run check:tokens`) |
| SEO and answer-engine checks | 40 pass (`npm run check:seo`) |
| Keyboard focus into the pinned scroller | passes |
| Language switch mid-scroll | motion rebuilds and the page stays pinned; scroll position can shift up to ~200px |

## 5. Not done, not verified

- **Real devices.** iOS Safari with pins (address-bar resize), Android Chrome and a real GPU were not tested. `anticipatePin` and `100svh` are set for it. Please open it on a phone before launch.
- **The logo is raster.** `logo.png` has hard-edged, low-resolution edges, so the flat mark in the architecture section is smoothed but still slightly soft. A vector logo (SVG) would fix it and also allow a true stroke-to-fill morph.
- **Chinese font.** Plex has no Han glyphs; the page falls back to PingFang, Microsoft YaHei or Noto Sans SC. Rendering was checked with Chrome on Windows only.
- **Unused heavy assets in `public/assets`** (`image0_*`, `image1_*`, the original partner PNGs and SVGs, two of which are 5 MB) still ship in `dist`. The page no longer loads them. Moving them out of `public/` would cut the deploy from 21 MB to a few MB.
- **Lighthouse** was not run.
