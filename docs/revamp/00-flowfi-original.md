# FlowFi original snapshot (pre-revamp)

Source of truth: git commit `30e0b76` (`git show 30e0b76:index.html`, `git show 30e0b76:src/i18n.js`).
Captured 2026-10-21. The uncommitted working tree at capture time is an earlier Taiko-style attempt, not the original.

## Brand

Positioning (from `public/brandguideline/FLOWFI_BRAND_GUIDELINES_V1.txt`): decentralized infrastructure for governing, deploying and compounding capital on-chain. Calm, intelligent, structured, transparent, long-term. No hype, no speculation language, no meme visuals.

| Rule | Guideline |
|---|---|
| Theme | Light, flat isometric system illustration (30/60 degrees) |
| Type | IBM Plex Sans (Inter / Source Sans 3 allowed). No all-caps headlines, no display fonts, numbers slightly emphasised |
| Grid | 8pt or 12pt scale, subtle low-opacity grid lines, white space = control |
| Buttons | Flat, subtle radius, no shadow, no glow. Primary = FlowFi purple |
| Icons | Outline SVG, same stroke weight as isometric art, functional only |
| Motion | Explains system behaviour. 150-250ms UI, 600-1200ms flows, one axis at a time. No bounce, elastic, overshoot, parallax |
| Never | Mascots, heavy gradients, photoreal 3D, neon/glow, crypto cliches (coins, rockets, flames), pure black/white |

Guideline palette: bg `#F8F9FB` / `#F2F3F6`, surface `#FFFFFF`, divider `#E6E8EE`, purple `#7B5CFA` (5-10% of screen), lavender `#B9A9FF`, ink `#2E2F33`, mid `#6B6F76`, light `#C8CCD4`, treasury gold `#F2C94C` (never on buttons).

### Logo files (`public/assets/`)

| File | Size | Notes |
|---|---|---|
| `logo.png` | 2576x884 | Flat mark + black "FlowFi" wordmark (mixed case). Nav, footer, favicon |
| `logo 3d.png` | 440x423 | Glossy 3D version of the same F mark. Hero and pinned vault section |
| `web3.svg` | - | Problem-section friction diagram |
| `partners/FFtoken.svg`, `Fairlaunch.svg`, `ecosystem.svg`, `collact.svg` | - | Economics card art |
| `partners/FF.svg` | - | Newsletter CTA art |
| `partners/ENI C 3.png`, `Debox C 3.png`, `DAOaaS C 3.png`, `aseanlabs b.png` | 1024x512 | Partner logos (eni.top, debox.pro, daoaas.io, aseanlabs.io) |
| `image0_1093_*.png` x4, `image1_1093_6284.png` | 885x884, 2752x1536 | Unused in the original page. `image1` is a rainbow ribbon that breaks the guideline |

Logo colours sampled from pixels of `logo.png`: orange `#F45921`, purple `#985BE6`, cyan `#00AEEA`, wordmark `#000000`. The guideline lists neither orange nor cyan, and its purple `#7B5CFA` is close to but not the logo purple. The original page also used `#FF4F84` pink for roadmap numbering, which is in neither.

## Page structure and copy (EN)

Nav: Infrastructure, Architecture, Economics, Roadmap, Launch App, EN/CN switcher. Original header was white with a 2px black border and hard black shadow. Font: IBM Plex Sans 400/500/600.

1. **Hero** `#hero`. "FlowFi is Capital, **Governed.**" Buttons: Establish Treasury, Read Whitepaper, View Governance. 3D logo. Partner marquee (DAOaaS, Debox, ENI, AseanLabs).
2. **Problem** `#infra`. "Web3 capital has scaled. **Governance hasn't.**" Passive treasuries suffer from non-productive stagnation. Millions in community assets sit dormant because the tools for audited deployment don't exist. Art: `web3.svg`.
3. **Vaults** `#vaults` (full-screen, pinned, 3D logo rotating between two floating labels).
   - Governance: "Rule & Consensus." The Governance Treasury manages protocol parameters, voting weights, and total FF consensus mechanisms. Total Locked **1.2B FF**. Link: Explore Governance.
   - Investor: "Execution & Growth." The Investor Treasury drives aggressive, audited growth through capital deployment and incubation. Seed Capital **$10M+**. Link: View Portfolio.
4. **Economics** `#economics`. "The Black Hole Launch." A deflationary, high-impact tokenomics framework designed for sustainable value capture and ecosystem growth. Four cards:
   - Capped Supply: strictly capped at 1 Billion FF. No inflation, no minting.
   - Fair Launch Distribution: 100% transparency, equal opportunity, no VC pre-allocations.
   - Ecosystem First: 50% allocated to ecosystem incentives and builder grants.
   - Deep Collateral: over-collateralized ratio ensuring protocol solvency and stability.
5. **Roadmap** `#roadmap`. "Long-term Infrastructure." FlowFi's roadmap is not about trends. It is about the systemic transition of capital to the ENI Mainnet. Phase 01 System Launch / Genesis Governance (Active), Phase 02 Expansion / Backflow Optimization (In Progress), Phase 03 Global Tier / Enterprise Scaling (Planned). Link: Read Whitepaper.
6. **Newsletter CTA**. "The Institutional Standard. Are you a governance architect? A yield-seeking strategist? An automated treasury?" FlowFi is the consensus layer for capital. Explore the dual-vault architecture, participate in governance, and automate your yield. Email field + Subscribe.
7. **Footer**. Columns: Architecture (Consensus Vaults, Investor Treasury, Core Features), Economics (Tokenomics, Black Hole Launch, Grants Program), Governance (DAO Portal, Discussion Forum, Snapshot Voting), Legal (Terms of Service, Privacy Policy, Security Audits). Status "Systems Operational", badges Certik Audited and Bitget Wallet Partner, "(c) 2026 FlowFi Foundation".

Interactions in the original: scramble-text on the two vault metrics, pinned vault section, partner marquee, EN/CN toggle (`localStorage` key `flowfi_lang`), mobile slide-in menu.

Not in the original: any real whitepaper/app/governance URLs (all CTAs were placeholders). `flowfi.gitbook.io` appears only in the uncommitted attempt and is unverified.

Chinese translations: `src/i18n.js` at the commit above (`cn` block).
