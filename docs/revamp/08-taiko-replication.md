# 08 · Rebuild to taiko.xyz's structure and motion

The first build borrowed Taiko's ideas but not its page. This rebuild copies taiko.xyz's section order, layout values, breakpoints and scroll choreography one module at a time, and keeps FlowFi's copy, colours and art. Every number below was read from Taiko's live CSS and page bundle, not estimated from screenshots.

Where this file and 03, 05 or 06 disagree, this file is current.

## Section map

| # | Taiko | FlowFi | Motion (all GSAP ScrollTrigger unless noted) |
|---|---|---|---|
| 1 | Hero: "Taiko is Ethereum, enhanced." + 3 buttons + 3D logo in a HUD frame | "FlowFi is Capital, Governed." + Read Whitepaper / View Architecture / View Governance + 3D mark | CSS light sweep across the frame (6s). On scroll the 3D mark falls out of the hero while the flat mark rises into screen 1 (scrub 1.2, `top 30%` to the icon's `top 30%`). |
| 2 | Scaling: 4 screens, "Taiko is based", 1 DAO, 1 Token, 1 Community | "FlowFi is governed", 1 Governance Treasury, 1 Investor Treasury, 1 FF Token | Pinned sideways scroll (`top+=300%`, scrub 1). A comet of light runs along three braided ribbons (`top+=330%`, scrub 1.5); each ribbon makes one wide loop around the screen-3 title. The paths are FlowFi's own, built from tangent-continuous Bezier knots in `scripts/make-home-assets.py`. The flat mark spins 1080° into a vault cube and back on a loop (power4, 2s holds). Pixel rain behind screen 1. |
| 3 | Explore: Taiko Alethia | Consensus Vaults, tag "[ Dual-vault architecture ]" | Pinned (`top+=135%` from 1025px, `top+=250%` below). CSS orbit, 10s. |
| 3b | (none on the home page; the grid is Taiko's `cards` component from its inner pages) | Economics: "The Black Hole Launch." and the original four cards (Capped Supply, Fair Launch Distribution, Ecosystem First, Deep Collateral) | The cards rise in with a 0.1s stagger, once, when the grid is 85% of the way down the viewport. |
| 4 | About: "We envision a based, fearless…" | "Web3 capital has scaled. Governance hasn't." | Grid lines draw in once (3s); hatched sides slide in; the title lights up letter by letter (scrub 0.5). |
| 5 | Journey (ink): 6 quarters on a path | Roadmap (ink): Phase 01-03 | A wide gradient band draws down a field of streaks (scrub 3); each phase opens when the band passes it. |
| 6 | Governance + video | "Are you a governance architect?" + a chain network: the FlowFi mark as the hub, nine chain coins around it (ENI, ETH, BNB, SOL, BTC, AVAX, TON, XRP, DOT; logos in `public/assets/chains/`) | Coins drift at random (GSAP `repeatRefresh`), packets travel each dashed line into the hub, the hub pulses, a random coin flips every 2.4s; all of it pauses off screen. Reduced motion: lines drawn, nothing moves. |
| — | (none) | FAQ, 9 questions | Native `<details>`; kept for answer engines |
| — | Footer: community tiles, link columns | Same layout; tiles are Whitepaper (live) and DAO / Forum / Snapshot (Soon) | none |

Sections 4-6 sit inside a wrapper (Taiko's `WrapSVG`): a gradient wave grows from the bottom over About (`height → 300vh`) and lands in the ink roadmap, and an upside-down copy shrinks away as Governance arrives (`height → 0`). The wave is `public/assets/home/wave.webp`, FlowFi gold → lavender → purple → ink.

Fixed chrome: a white pill header (60px, 20px from the top) with four mega menus (About, Economics, Governance, Resources), the language switch and Read Whitepaper; a full-screen menu at 1100px and below (Taiko switches at 1024px, but our language switch and CTA are wider than its icons; between 1101 and 1340px the nav sits between logo and actions instead of centred); and the `[ ▪ ▪ ▪ ]` section rail at the left from 1280px (Taiko shows it from 991px; below 1280 it lands on full-width content such as the economics cards).

## Design values that changed

- **Type:** Clash Display 500 for display sizes, Public Sans for everything else (Taiko's pairing). IBM Plex is gone. Scale: 85/0.8 display, 70/0.9 section titles, 14px/600 uppercase labels at 0.04em, 16px/1.255 body. CJK gets looser leading through `:lang(zh)`, and the Chinese hero and about titles carry their own line break.
- **Colour roles:** large text and graphics use purple-500 `#7B5CFA`. Small text, labels and buttons use purple-600 `#6842F0` (white on it is 5.8:1, so 16px/600 button labels pass AA as normal text). Ink text `#2E2F33`, roadmap surface `#17181C`, page white, canvas `#F8F9FB`.
- **Overridden decisions:** D4 (fonts), D5 (no eyebrows: Taiko's uppercase labels are back) and the 19px bold button label are replaced by the values above.
- **Logo:** traced to vectors (`public/assets/brand/`): full logo in black and white, mark, wordmark (`currentColor`), and the 3D mark's outline. The header, footer, favicon, PWA icons and share images now come from these.

## Copy changes in this pass

Polished, not rewritten. These moved or were dropped because Taiko's layout has no slot for them; please confirm:

- The economics cards are back as their own section after Consensus Vaults (the user chose this on 2026-10-21), with the same polished copy as the first build. The FAQ repeats their facts for answer engines.
- The treasury metrics (1.2B FF locked, $10M+ seed capital) now appear only in the FAQ.
- "Rule & Consensus." and "Execution & Growth." are dropped; the scaling screens read "1 Governance Treasury / 1 Investor Treasury / 1 FF Token", as Taiko's read "1 DAO / 1 Token / 1 Community".
- Partner logos and the Certik / Bitget badges moved from the hero to the footer. The badges are solid purple pills; "Soon" tags are soft tinted pills with purple text (swapped at the user's request).

## Files

`index.html` (markup; `<!--svg:name-->` markers are inlined from `scripts/snippets/` by the Vite plugin), `src/style.css`, `src/tokens.css`, `src/main.js`, `src/rain.js`, `src/i18n.js`. Decorative layers come from `scripts/make-home-assets.py`; the logo from `scripts/trace-logo.py`.

## Checked

- `npm run build`, `check:seo` (42 pass) and `check:tokens` (all pairs pass).
- Headless Chrome at 1440×900 and 390×844, English and Chinese, plus reduced motion: no console errors and no horizontal overflow.
- Reduced motion or no JS: screens stack, nothing pins or scrubs, the CSS loops stop, and the about title shows in full.
- Mega menu opens on hover and on click, closes on Escape and outside clicks; the mobile menu makes the page behind it inert; switching language re-splits the about title.

## Not verified

- Real devices (iOS Safari's address bar changes `100vh` mid-scroll, which affects the pins), touch scrolling feel, and screen readers.
- Clash Display loads from Fontshare's CDN; check its licence terms for your use, or self-host it.
- Frame rate on low-end hardware with the rain, the gradient sweep and the band drawing at once.
- The chain logos are redrawn from each project's published mark, not downloaded. Before launch, swap in the official files from each brand kit, and confirm FlowFi may show them: logos of chains FlowFi does not integrate with can read as a claim of support or partnership.
