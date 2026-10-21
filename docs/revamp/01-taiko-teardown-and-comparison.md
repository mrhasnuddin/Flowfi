# 01 · Taiko teardown and comparison with FlowFi

Evidence: cached capture of taiko.xyz (`taiko_raw.html`, `taiko_all.css`, `taiko_page_chunk.js`, fetched 2026-10-21), live DOM and computed styles read in a browser the same day, and 1440×900 and 390×844 screenshots taken with headless Chrome at ten scroll offsets. The GSAP timeline code lives in a vendor chunk that was not read, so pin lengths below are measured from the live DOM, not from source.

## 1. How taiko.xyz is built

| Layer | Finding | Confidence |
|---|---|---|
| Framework | Next.js App Router (`/_next/static/chunks/app/page-*.js`), static HTML with hydration | Observed |
| Styling | CSS Modules (`hero_hero_title__idHdc` style names, 5 hashed stylesheets). **No CSS custom properties**: `#e81899` is hard-coded 53 times, `#0b101b` 43 times | Observed |
| Scroll engine | GSAP + ScrollTrigger (`window.gsapVersions`, `window._gsap`, `.pin-spacer` wrappers). Native scroll, no smooth-scroll library found | Observed |
| Other libs | Swiper (theme var present), HTML5 `<canvas>` 2D, an mp4 (`governance.mp4`), SVG sprite (`/img/sprite.svg#icon`), WebP art. "rive" appears 3× in the page chunk, use not confirmed | Observed / Unknown |
| Fonts | Clash Display (headlines), Public Sans (nav, body, buttons). Clash Grotesk, Gilroy, Helvetica Neue Cyr and Onest are preloaded but barely used in CSS | Observed |
| i18n / a11y | English only, no `hreflang`, **zero `prefers-reduced-motion` rules** in the CSS bundle (JS handling not checked) | Observed / Unknown |

### Page anatomy (1024px viewport, 11,227px tall)

| # | Section | Mechanic | Visual |
|---|---|---|---|
| 0 | Floating nav | `position:fixed; top:20px`, white pill 60px tall, no shadow, no blur. Four dropdowns (About, Ecosystem, Build, Governance), bell, three social icons. Becomes a bare bar on mobile | White pill on `#F8F8F8` |
| – | Left scroll rail | Fixed vertical bracket with pink dots that fill as you scroll | Small, quiet |
| 1 | Hero | Static. Centred 2-line headline, three pill buttons (1 solid, 2 outlined), 3D mark inside a blueprint frame (corner brackets, crosshair ticks), dot matrix, pastel wash | Light, airy |
| 2 | "Scaling" | **Pinned horizontal scroller.** `.pin-spacer` 3,072px (~4 viewports) holds a fixed wrapper 4,096px wide (4 screens) that translates left as you scroll (−1,741px at scrollY 2000). Each screen: big pink "1" + word + "Learn More" pill. Behind: parallax ribbon image at 50% opacity, SVG swooshes, falling-dot canvas | Ribbons and blueprint circles |
| 3 | Explore | Second pin (1,920px = 768 + 1.5 viewports). Outline mark morphs to filled mark. `[ LABEL ]` eyebrow with underline, centred title, one button | Grid with + marks |
| 4 | About | Bordered grid container, eyebrow, 56px title whose **letters fade 0.2→1 opacity with scroll**, paragraph | Hairline grid |
| 5 | Transition | Full-width gradient wave (yellow → pink → purple → near-black) hands the page from light to dark | The one loud moment |
| 6 | Roadmap | **Dark band.** Sticky stage, quarter cards skewed in 3D, diagonal light streaks in purple, pink and gold between them | Dark, glassy |
| 7 | Governance | White, dot grid, eyebrow, 62px title, paragraph, looping video of coloured ribbons with avatar nodes | Light, colourful |
| 8 | Footer | "Join the community" row of 6 grey tiles, logo + one-line pitch, 4 link columns with uppercase heads and ↗ on external links, © line | Quiet |

### Tokens as shipped (computed values)

| Role | Value |
|---|---|
| Canvas / surface | `#F8F8F8` / `#FFFFFF`; footer tiles `#F8F8F8`, radius 17px |
| Ink | `#0B101B` (headlines), `#191E28` (footer heads) |
| Brand | `#E81899` pink; tints `#F997D0`, `#EA36A4`, `#FFF3FA`; accent gold `#FFC037` |
| Display type | Clash Display 500, hero 85px / line-height **0.8**, tracking −0.02em, max-width 10em; section titles 56–70px / 0.9 |
| UI type | Public Sans 500 16/20 nav; 600 16/1.255 buttons, tracking −0.02em; eyebrow 600 14/16.8, +0.04em, uppercase, pink |
| Button | 50px tall, radius 100px, label then a 32px white disc (8px margin) holding two stacked arrows in `overflow:hidden`; outlined variant 1.8px border. Hover: the arrow slides through the disc (`translateX(-100%)` → `0`, 0.3s ease, 0.1s delay). The label does **not** animate. The text "roll-up" in the uncommitted FlowFi attempt was not a Taiko behaviour |
| Radii in use | 100 (pill), 30, 25, 20, 16, 12, 50% |
| Layout | max-width 1550px, 25px side padding, nav inset 40px at 1440 |
| Breakpoints | 376, 565, 768, 991, 1124, 1366, 1600 (7 of them, one per bug fix) |
| Motion | Mostly `ease` 0.1–0.35s for UI, `width .8s` for the rail, one keyframe each for hero background shimmer (`background-position` sweep), logo rotation, icon pulse. No custom cubic-bezier anywhere in the CSS |

### What Taiko does well, worth taking

1. **One focal object per screen**, big type, lots of air. Nothing competes with the headline.
2. **Blueprint vocabulary** (dot matrix, corner brackets, + marks, ticks) reads as engineering precision. This is already FlowFi's brand language ("Infrastructure, Precision, Modularity", subtle grid).
3. **Pill button with an arrow disc** gives a clear 1 solid + 2 outlined hierarchy without shadows.
4. **Storytelling by scroll** where the scroll *is* the explanation: three things, one at a time, then a logo that fills in.
5. **Footer as a community gateway** rather than a link dump.

### What not to copy

| Taiko behaviour | Why FlowFi should not copy it |
|---|---|
| Line-height 0.8 headlines | Fails the type rule (display ≥ 1.1 in better-typography) and will crush Chinese. FlowFi ships EN + CN |
| White text on `#E81899` is 4.18:1 | Fails AA for 16px text. FlowFi's `#7B5CFA` is 4.42:1 and fails too, handled with large bold button labels (see 03) |
| No reduced-motion rules, no i18n | FlowFi already has EN/CN. Pins must degrade to stacked sections |
| Six fonts preloaded, three used | Performance cost with no gain |
| No design tokens | Taiko re-types `#e81899` everywhere. FlowFi gets a three-tier token set |
| Mobile hero CTAs overflow the screen edge (seen at 390px) | FlowFi already fixed this once ("Fix partially obscured Hero CTA") |
| Gradient wave, glow, glassy 3D cards | Conflicts with brand V1 (no heavy gradients, glow, parallax). See decisions D1, D6 |

## 2. Side-by-side

| Dimension | Taiko (live) | FlowFi original (`30e0b76`) | FlowFi uncommitted attempt | Revamp target |
|---|---|---|---|---|
| Theme | Light, one dark band | Light | Light | Light, optional ink band (D1) |
| Brand colour | Pink `#E81899` | Purple `#7B5CFA`, gold, black-bordered brutalist chrome | Purple, orange, gold | Purple primary, gold for treasury, guideline colours only (D3) |
| Type | Clash Display + Public Sans | IBM Plex Sans | Plus Jakarta + Space Grotesk + Plex (3 families) | IBM Plex Sans only (D4) |
| Nav | Floating white pill, 4 dropdowns | Full-width white bar, 2px black border, hard shadow | Sticky header | Floating pill, 4 menus, EN/CN, Launch App |
| Hero | Centred headline, 3 pills, 3D mark in HUD frame | Left headline, 3 equal buttons, 3D logo, partner marquee | Left-aligned, purple, stats row | Centred headline, 1 solid + 2 outlined, 3D mark in frame, partner row beneath |
| Narrative | Scaling → Explore → About → Roadmap → Governance | Problem → Vaults (pinned) → Economics → Roadmap → CTA | Triad → Architecture → Manifesto → Roadmap → **Simulator** → CTA | See 04 |
| Scroll | GSAP pin + scrub, letter reveal | Pinned vault section, scramble numbers | IntersectionObserver fades | 2 pins max, reveal elsewhere (D6) |
| Motion tokens | Hard-coded | Hard-coded | Hard-coded | Named duration and easing tokens |
| i18n | none | EN / CN | EN / CN | EN / CN, CJK type rules |
| Tokens | none | partial CSS vars | partial CSS vars | 3 tiers, contrast-checked |

### Things in the uncommitted attempt that are not in the original FlowFi content

These were invented in an earlier pass. Do not carry them forward without sign-off.

- "Interactive Yield Simulator" with outputs like "$420k / yr" and "7,250 Votes". Yield figures on a "no hype, no speculation" brand are a compliance risk.
- Dated roadmap quarters (Q1–Q3 2026) and "formal Certik security verification". The original has Phase 01–03 with no dates.
- "Consensus Triad", "Architecture Council" and "ENI Mainnet Operational / Epoch 24,891" status copy.
- A `flowfi.gitbook.io` whitepaper link. No real URLs exist in the original.

## 3. Decisions

Settled 2026-10-21: five recommended defaults accepted, three flipped.

| ID | Decision | Outcome | What it means |
|---|---|---|---|
| D1 | One dark "ink" band (roadmap) despite V1's light theme | **Yes** (default) | Roadmap uses `#17181C`, never pure black. The same tokens flip, no dark components |
| D2 | Button shape | **Pill** (default) | Matches Taiko. V1's "subtle radius" is overridden for controls only |
| D3 | Palette | **Flipped: guideline colours only** | No logo cyan or orange in the UI, no purple-600 as a resting fill. White on `#7B5CFA` is 4.42:1, so button labels are 19px bold (WCAG large text). **Confirmed 2026-10-21: keep the large bold label.** Small text is never purple. Escape hatch in [03](03-design-system.md) |
| D4 | Type | **IBM Plex Sans only** (default) | Weights 400, 500, 700. CJK fallback stack |
| D5 | `[ LABEL ]` eyebrows | **Flipped: none** | No tag above a headline anywhere. The architecture diagram keeps plain "Governance" and "Investor" callouts as annotations |
| D6 | Scroll-pinned storytelling | **Two pins** (default) | Triad scroller and mark morph, stacked fallback under 768px and with reduced motion |
| D7 | Real URLs and backend | **Flipped: gitbook only** | The whitepaper is `https://flowfi.gitbook.io/flowfi` (verified, resolves). Every other link waits for a real URL in one registry, shown as plain text meanwhile. The newsletter form is held until an endpoint exists. Interim CTA wiring, confirmed: the solid hero and nav button read "Read Whitepaper" until an app URL exists, see [04](04-ia-and-user-flows.md) |
| D8 | Invented simulator and dated roadmap | **Drop** (default) | Roadmap stays Phase 01 to 03 with no dates |
