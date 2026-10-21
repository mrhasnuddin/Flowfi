# 03 · Design system, tokens and semantics

> Superseded in part by [08 · Rebuild to taiko.xyz's structure and motion](08-taiko-replication.md): type, button colour, section structure and motion values there are current.

Source of truth for values: [`src/tokens.css`](../../src/tokens.css) (imported by `src/main.js`). Every contrast ratio below was computed from that file (WCAG 2.x relative luminance, 35 pairs, all pass). Decisions as settled on 2026-10-21: D1, D2, D4, D6, D8 at the recommended default; **D3 flipped (guideline colours only), D5 flipped (no eyebrows), D7 flipped (placeholder URLs for now)**. See [01](01-taiko-teardown-and-comparison.md#3-decisions-needed).

Skills applied: **better-typography** (type roles, leading, tracking, CJK, tabular numbers), **emil-design-eng** (motion frequency/purpose/easing, press feedback), **landing-page** (one primary action, section order, in 04), **humanize** (copy rules, §9).

## 1. Principles

Taiko's look, FlowFi's meaning.

1. **Structure over decoration.** The blueprint vocabulary (grid, brackets, + marks) is kept because it *is* FlowFi's brand: infrastructure, precision, modularity. Anything that only glows is dropped.
2. **One focal object per screen.** One headline, one visual, at most one solid button.
3. **Colour is state, not mood.** Purple = governance and action. Gold = treasury value. Everything else is neutral. Taiko's pink-everywhere becomes FlowFi's purple-sparingly (≤10% of the viewport, per V1).
4. **Motion explains the system.** Scroll sequences exist only where the sequence *is* the explanation (three vaults one at a time, the mark filling in). Everything else is a 320ms fade.
5. **Works in English and Chinese, with and without motion.** Every pinned section has a stacked fallback.

## 2. Token architecture

| Tier | Prefix | Example | Who may read it |
|---|---|---|---|
| 1 Primitive | `--ff-*` | `--ff-purple-600` | Tier 2 only |
| 2 Semantic | `--color-*`, `--space-*`, `--type-*`, `--radius-*` | `--color-action-primary-bg` | Tier 3 and any component |
| 3 Component | `--btn-*`, `--nav-*`, `--card-*`, `--frame-*` | `--btn-height` | The one component |

Rules: components never reference `--ff-*` or a hex value. Dark (ink) is a **surface**, not a theme: `[data-surface="ink"]` re-maps tier 2, so no component needs a dark variant. Chinese is a `:lang(zh)` re-map of type roles.

## 3. Colour

### Primitives

| Family | Steps | Notes |
|---|---|---|
| Neutral | 0 `#FFFFFF` · 25 `#F8F9FB` · 50 `#F2F3F6` · 100 `#E6E8EE` · 200 `#DDE0E8` · 300 `#C8CCD4` · 350 `#9AA0AA` · 400 `#8A8F98` · 500 `#6B6F76` · 600 `#5A5E66` · 900 `#2E2F33` · 950 `#17181C` | 25/50/100/300/500/900 are V1. 350, 400, 600, 950 are new: muted-on-ink, 3:1 control border, secondary text, ink surface |
| Purple | 50 `#F5F2FF` · 100 `#ECE6FF` · 200 `#D9CFFF` · 300 `#B9A9FF` · 400 `#9A82FC` · **500 `#7B5CFA`** · 600 `#6842F0` · 700 `#5733D4` · 800 `#4426A8` · 900 `#2F1B75` | 300 and 500 are V1. 600–800 are for hover, active and info states only. No resting fill uses them (D3) |
| Gold | 50 `#FFF9E6` · 300 `#F7E08F` · 500 `#F2C94C` · 700 `#8A6A00` | V1: treasury objects only, never buttons |
| Green / Red | 50 + 700 each (`#16704A`, `#C2362F`) | Status only. Functional, not brand |

The logo's own orange `#F45921`, purple `#985BE6` and cyan `#00AEEA` stay inside the logo image. They are not tokens and are not used in UI or illustration (D3).

### Semantic roles and verified contrast

Small text is never purple. Purple-500 is 4.19:1 on the canvas, so it carries large text (≥24px, or ≥18.66px at weight 700), button fills and graphics. Small links are ink with a purple underline.

| Role | Token → value | Pair | Ratio | Need |
|---|---|---|---|---|
| Body text | `text-primary` `#2E2F33` | on canvas `#F8F9FB` | 12.69 | 4.5 |
| Secondary text | `text-secondary` `#5A5E66` | on canvas / surface | 6.18 / 6.51 | 4.5 |
| Tertiary text | `text-tertiary` `#6B6F76` | on canvas / subtle | 4.79 / 4.55 | 4.5 |
| Large brand text | `text-brand` `#7B5CFA` | on canvas / brand tint | 4.19 / 4.00 | 3 (large) |
| Link underline | `link-underline` `#7B5CFA` | on canvas | 4.19 | 3 |
| Primary button, resting (19px bold label) | `#FFFFFF` on `#7B5CFA` | | 4.42 | 3 (large) |
| Primary button hover / active | `#FFFFFF` on `#6842F0` / `#5733D4` | | 5.79 / 7.42 | 4.5 |
| Outline button (19px bold label) | `#7B5CFA` | on canvas / hover tint | 4.19 / 4.00 | 3 (large) |
| Treasury text | `text-treasury` `#8A6A00` | on canvas | 4.81 | 4.5 |
| Status text | success `#16704A` · warning `#8A6A00` · danger `#C2362F` · info `#5733D4` | on own tint | 5.44 · 4.81 · 4.75 · 6.72 | 4.5 |
| Input border | `border-control` `#8A8F98` | on surface / canvas | 3.25 / 3.08 | 3 |
| Focus ring | `focus-ring` `#7B5CFA` | on canvas / surface | 4.19 / 4.42 | 3 |
| Domain marks (small) | purple-500 · gold-700 | on canvas | 4.19 · 4.81 | 3 |
| **Ink band** text | `#FFFFFF` / `#C8CCD4` / `#9AA0AA` | on `#17181C` | 17.74 / 11.02 / 6.74 | 4.5 |
| Ink band brand text | `#B9A9FF` | on `#17181C` / ink surface | 8.60 / 6.93 | 4.5 |

**What keeping to guideline colours (D3) costs**

| Consequence | How it is handled |
|---|---|
| White on `#7B5CFA` is 4.42:1, 0.08 short of AA for normal text | Button labels are 19px at weight 700, which WCAG counts as large text (3:1). That is why buttons read bigger than Taiko's 16px |
| Purple text under 24px fails (4.19:1) | No small purple text. No eyebrows (D5), links are ink with a purple underline, status chips use their own tints |
| No cyan or orange | Two domain colours remain: purple for governance, gold for treasury. Illustration ribbons use purple-500, lavender-300 and gold-500 |
| Hover and active need a darker step | purple-600 and 700 exist for states only. Both pass AA with white |
| Taiko's own white on `#E81899` | 4.18:1, not carried over |

**Decision (2026-10-21): keep the 19px bold label on `#7B5CFA`.** If an audit or a regulator later expects 4.5:1 on every label, the smallest fix is to make the resting button fill purple-600 `#6842F0` (5.79:1). Nothing else moves.

### Colour budget

- Solid purple: **one filled button per viewport**, plus the nav CTA.
- Gold never on a button or as text on white. Gold-700 for text, gold-500 for large fills.
- Pure black and pure white are not text colours. (`#FFFFFF` is the *card surface*, as V1 specifies, and text on ink.)

## 4. Typography

Family: **IBM Plex Sans** 400 / 500 / 700, nothing else (D4). One tabular-figures rule for every number.

Fallback stack for Chinese: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC"`. Plex has no Han glyphs, so verify this renders acceptably at build time (not tested yet).

| Role | Size (min → max) | Line-height | Tracking | Weight | Used for | Taiko equivalent |
|---|---|---|---|---|---|---|
| `display-xl` | 48 → 88px | 1.02 | −0.03em | 500 | Hero H1 only | 85 / **0.8** |
| `display-lg` | 40 → 64px | 1.05 | −0.03em | 500 | Section H2 | 56–70 / 0.9 |
| `h2` | 32 → 48px | 1.1 | −0.025em | 500 | Pinned screen titles ("1 Governance Treasury") | 68 |
| `h3` | 24 → 32px | 1.2 | −0.02em | 500 | Card titles | – |
| `h4` | 20px | 1.3 | −0.01em | 700 | Column and list titles | – |
| `body-lg` | 20px | 1.5 | 0 | 400 | Lead paragraph | – |
| `body` | 16px | 1.6 | 0 | 400 | Paragraphs. Nav links at 500 | 16 / 20 |
| `button` | 19px | 1.25 | −0.02em | 700 | Button labels. Counts as WCAG large text (D3) | 16 / 1.255 / 600 |
| `body-sm` | 14px | 1.5 | 0 | 400 | Card text, footer links | – |
| `caption` | 13px | 1.4 | 0 | 400 | Notes, legal | – |
| `label` | 13px | 1.2 | +0.05em | 700, uppercase | Footer column heads and chips only. **No eyebrows (D5)** | 14 / +0.04em |
| `stat` | 40 → 64px | 1.0 | −0.02em | 500, `tabular-nums` | Big numbers | – |

Rules (from better-typography, checked against the roles above): unitless line-height everywhere; tracking in `em`; sizes in `rem`; headings descend with level; no uppercase tag above a headline (D5); display never below 1.0 (Taiko's 0.8 fails); `text-wrap: balance` on headings, `pretty` on paragraphs; measure capped at 64ch; `text-transform: uppercase` only on `label` (footer heads, chips), stored text stays in natural case; smart punctuation in rendered strings.

CJK: headings 1.2–1.3, body 1.75, tracking 0 (see `:lang(zh)` in the tokens). Max two lines of display text still holds because Chinese runs shorter.

## 5. Space, grid, layout

- **8pt scale**: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 · 160.
- **Container** 1280px content, 1440px wide; side gutters 16 / 24 / 40px at <768 / ≥768 / ≥1280. Taiko uses 1550 + 25.
- **Section rhythm** 80 / 96 / 128px top and bottom. A section owns its padding; no stacked margins.
- **Breakpoints**: 480 · 768 · 1024 · 1280 · 1536 (Taiko has seven ad-hoc ones). Mobile-first.
- **12-column grid**, 24px gaps; the centred hero and pinned screens ignore it by design.
- **Texture**: `texture-lines` (hairline grid, 48px cell, `grid-line` token) behind architecture and economics; `texture-dots` (Taiko's dot matrix) behind hero and the CTA. Both ≤ 70% of neutral-100, never over text blocks that need contrast.

## 6. Shape and elevation

| Token | px | Use |
|---|---|---|
| `r-pill` | 999 | Buttons, nav, status pills |
| `r-lg` | 20 | Cards, pinned-screen panels |
| `r-md` | 12 | Tiles, inputs |
| `r-sm` | 8 | Small chips, focus outline radius |

Elevation is **layering, not shadow** (V1): canvas → surface (white) → ink. A card is a white surface with a 1px `border-subtle`. The only shadow-like effect is the focus ring. The floating nav gets a 1px border instead of Taiko's nothing, so it still reads over white sections.

## 7. Motion

| Token | Value | Use |
|---|---|---|
| `dur-instant` | 100ms | Colour on press |
| `dur-fast` | 160ms | Press scale, tooltip |
| `dur-base` | 220ms | Hover, arrow slide, menu open (V1 range 150–250) |
| `dur-slow` | 320ms | Section reveal |
| `dur-flow` | 900ms | Flow lines, ribbon draw (V1 range 600–1200) |
| `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Anything entering or responding |
| `ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Anything moving on screen |
| `linear` | – | Scroll-scrubbed sequences, progress |

No overshoot, spring or bounce curve exists in the set. `ease-in` is not provided (it feels slow).

### Patterns

| Pattern | Spec | Why it animates (emil-design-eng test) |
|---|---|---|
| Button | Hover: arrow slides through the disc, `translateX(-100%)→0`, 220ms ease-out, no delay (Taiko adds 0.1s; it reads as lag). Press: `scale(0.97)` 160ms. Focus: ring, no animation | Feedback |
| Reveal | `opacity 0→1` + `translateY(12px→0)`, 320ms ease-out, 60ms stagger, **once** | Prevents elements popping in |
| Text statement | Letters or words go 0.2→1 opacity, scrubbed linearly while the block crosses the viewport (Taiko's About) | Explanation, used once |
| Pinned triad | One pin, three screens, horizontal travel = 3 screen widths over ~3 viewports of scroll, `linear` scrub | The sequence *is* the explanation |
| Mark morph | Outline → fill of the FlowFi mark, second and last pin, ~1.5 viewports | Same |
| Scroll rail | Left dots fill with progress; hidden under 1024px | Wayfinding, optional |
| Numbers | Count or scramble **once** on first entry, ≤600ms. Optional; drop if it feels playful | Marketing |

Never animate: nav link hovers beyond colour, keyboard-initiated actions, language switch (instant), anything on every scroll tick that is not scrubbed deliberately.

**Reduced motion and small screens.** Under `prefers-reduced-motion: reduce` and under 768px: pins and scrubs are not created, screens stack vertically, reveals are instant, the ribbon canvas does not run. The tokens already zero the durations.

## 8. Components

| Component | Anatomy and spec | States |
|---|---|---|
| **Nav pill** | `fixed`, top 20, inset 16/24/40, height 60, `r-pill`, surface + 1px border. Left: mark + wordmark. Centre: 4 menus (Protocol, Economics, Governance, Resources), 16/500, hit area ≥44px. Right: EN / 中文 switch, **Launch App** (md button). <768: mark + menu button, full-sheet menu | Link hover = colour. Menu open 220ms ease-out. Current section marked with 2px underline |
| **Button** `lg` 48 / `md` 44 | Label 19px/700 −0.02em (large text, D3) · 20px left pad · 32px white disc with 14px arrow, 7px margin (md: 6px). Variants: **primary** (purple-500 fill, white label, purple-500 arrow), **outline** (1.5px purple-500, purple label, purple disc with white arrow), **on-ink** (outline in purple-300). Hierarchy per viewport: 1 primary + up to 2 outline | hover bg purple-600 + arrow slide · active purple-700 + scale .97 · focus 2px `focus-ring`, 2px offset · disabled n-100 / n-500 |
| **Stat** | `stat` number + `caption` label under it. Domain colour only on a 6px dot, not on the digits. No uppercase tag above it | static |
| **Card** | `surface`, 1px `border-subtle`, `r-lg`, 32px pad, no shadow. Title `h3`, body `body-sm`, optional stat, optional text link with ↗ | hover: border → purple-300, 160ms |
| **Persona tile** | Card variant, whole tile is one link, arrow disc bottom-right. Used for the three audiences | same as card + press scale .98 |
| **Blueprint frame** | Four 16px corner brackets (1px purple-500), + marks at two grid intersections, 2 tick groups. Decorative, `aria-hidden`. Wraps the hero mark and the architecture diagram | static |
| **Partner row** | 4 logos, equal 160×64 cells, `opacity .85`, grey rule above. **No marquee** (4 logos do not need one) | link hover opacity 1 |
| **Status pill** | `r-pill`, status tint + dot + 13px label. "Systems operational" only if backed by a real feed (D7) | live dot pulses 2s, static under reduced motion |
| **Roadmap card** (ink band) | `ink-surface`, 1px `border-default`, `r-lg`, phase number, title, 2–3 bullets, status pill. The 3D skew is optional polish; flat is the baseline | static |
| **Form field** (newsletter held until an endpoint exists, D7) | 48px input (`r-md`, 1px `border-control`, 16px text so iOS does not zoom), primary button, inline error / success text (status tokens), `aria-live="polite"` | default · focus · error · submitting · success |
| **Footer** | Community tiles row (`tile`, 6 max), mark + one-line pitch, 4 columns with `label` heads and ↗ on external links, badges (Certik, Bitget) as plain text pills, © line | link hover underline |

## 9. Iconography, illustration, content

- **Icons**: outline, 1.5px stroke, 24px grid, round joins, `currentColor`. Arrows ↗ for external links, → for in-page. No filled icons (V1).
- **Hero mark**: reuse `logo 3d.png` first. Upgrade path: rebuild as three extruded, flat-shaded isometric ribbons with `img2threejs` so it can tilt with the pointer and stay on-brand (V1 bans photoreal 3D, the glossy PNG is the only exception).
- **Ribbon illustration**: flowing strips in purple-500, lavender-300 and gold-500 (no cyan or orange, D3), solid fills, no gradients, consistent 2px outline option. Replaces Taiko's pink swooshes in the pinned triad, the governance section and the CTA. `anatomy` / `hairline-create` can generate isometric figures for the architecture diagram.
- **Unused assets**: `image1_1093_6284.png` (rainbow ribbon) breaks V1 (neon, gradient). Leave out.
- **Copy rules** (humanize + V1): sentence case; numbers and nouns over adjectives; CTAs are verb + object ("Open the app"); no *seamless, unlock, revolutionary, next-gen*, no rocket/coin/flame; one idea per sentence; no stacked em dashes. The original says "drives **aggressive**, audited growth", which contradicts V1's "no aggressive marketing language": reword. Chinese copy is written, not machine-translated; keep `Black Hole Launch` (黑洞启动) consistent with the existing glossary in `i18n.js`.

## 10. Build notes

Status after the build ([05](05-stack-and-storytelling.md)): items 1, 3 and 5 are done. Tailwind was dropped in favour of plain CSS on these tokens, so item 2 no longer applies. Item 4 is done with one change: the architecture pin starts at 1100px, not 768px.

1. Add `src/tokens.css` (from the draft) and import it before `style.css`.
2. Tailwind is loaded from the CDN. Map utilities to the semantic tokens (`colors: { brand: 'var(--color-text-brand)' … }`) so no hex reaches markup. Moving to the Vite Tailwind plugin is worth doing before launch (the CDN build is not for production).
3. Load Plex with `font-display: swap`, 3 weights (400, 500, 700), self-hosted, `lang`-aware preload.
4. GSAP + ScrollTrigger only for the two pins; everything else is CSS and `IntersectionObserver`. Gate on `matchMedia('(min-width:768px) and (prefers-reduced-motion:no-preference)')`.
5. Token lint: [`scripts/check-token-contrast.cjs`](../../scripts/check-token-contrast.cjs) resolves the semantic tokens and exits non-zero if any of the 35 pairs drops below its threshold. Run `npm run check:tokens`.
