# 07 · Share images, SEO, GEO and AEO

Everything here ships in the build and is checked by `npm run check:seo` (40 checks, all pass). Skill used: `fixing-metadata`.

## What shipped

| Area | What | Where |
|---|---|---|
| **Share image, landscape** | 1200×630 PNG: wordmark, "FlowFi is Capital, Governed.", one-line description, 3D mark in a blueprint frame. Used by Facebook, LinkedIn, X, Slack, Telegram, WhatsApp | `public/og/og-landscape.png` |
| **Share image, 1:1** | 1200×1200 PNG, same content stacked. Second `og:image`, for apps that crop to a square | `public/og/og-square.png` |
| Regenerate | Both come from one template | `npm run og` (needs Chrome; `CHROME=` overrides the path) |
| Meta | Title (58 chars), description (150 chars), canonical, `og:url` identical to canonical, `og:type`, locale and `zh_CN` alternate, X card `summary_large_image`, all image URLs absolute, alt text on both images | `index.html` |
| Icons | `favicon.ico`, 32px PNG, 180px Apple touch icon, 192 and 512 manifest icons, `theme-color`, web manifest | `public/` |
| Crawl files | `robots.txt` (allows search and AI crawlers, names them, points at the sitemap), `sitemap.xml`, `llms.txt`. Generated at build from one `SITE_URL` | `vite.config.js` |
| Structured data | One JSON-LD graph: `Organization`, `WebSite`, `WebPage`, `FAQPage`. `sameAs` is the whitepaper. No ratings, no addresses, no founders | `index.html` |
| Page structure | One `h1`, no skipped heading levels, landmarks, every image has `alt`, skip link, `lang` follows the language switch | `index.html`, `src/i18n.js` |

## SEO

- All text is in the HTML source, not injected by script, so a crawler that never runs JavaScript still reads every section, the FAQ and the footer.
- Canonical, `og:url` and the sitemap all come from one value, so they cannot disagree.
- Fonts are `display=swap`, images have `width`/`height`, below-the-fold images are `loading="lazy"`, the hero mark is preloaded with `fetchpriority="high"`. Total JS is 53 KB gzipped.
- **Chinese is a client-side toggle on one URL.** Crawlers see English only. If Chinese search matters, make `/zh/` a real page and add `hreflang` pairs; the copy and type rules are ready.

## AEO (answer engines)

- The FAQ has 8 questions, each answered in one or two plain sentences that **start with the answer** ("FF is capped at 1 Billion. There is no inflation and no minting.").
- The `FAQPage` schema is generated from the same wording as the visible text, and `check:seo` fails if the two ever differ.
- Google now shows FAQ rich results only for a few government and health sites, so do not expect a visual result in search. The markup still helps assistants read the page as question and answer.

## GEO (generative engines)

- **Definition first.** The first FAQ answer and the hero sub-line define FlowFi in one sentence, in the same words the schema and `llms.txt` use, so a model that quotes any of them quotes the same thing.
- **One name per thing.** "FlowFi", "FF", "Governance Treasury", "Investor Treasury", "Black Hole Launch", "ENI Mainnet" are never varied.
- **Facts as short statements with numbers**, in the FAQ, the pinned screens and the cards.
- **`/llms.txt`** is a plain-text digest of the same facts plus the whitepaper link.
- **`robots.txt` names** GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended and Applebot-Extended and allows them. Delete those blocks if you would rather opt out of training.
- **Citable source.** The whitepaper is `sameAs` in the schema and linked from the FAQ. The more of the whitepaper that is public and consistent with the page, the more a model has to cite.

## Before launch

| Need | Why |
|---|---|
| **Set `SITE_URL`** in Vercel to the production domain | The default, `https://flowfi2.vercel.app`, is my guess from the project name. Vercel access was denied for that team, so I could not read the real domain. Canonical, `og:url`, sitemap, robots and schema all follow this one value |
| **Check the share images on the live URL** (Facebook Sharing Debugger, LinkedIn Post Inspector, X card preview) | Scrapers cannot fetch `localhost`, and platforms cache the first result |
| Submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools | Discovery |
| Confirm "Certik audited" and link the report | It is now an explicit claim in the FAQ, the schema and `llms.txt` |
| Vercel preview deployments | They send `noindex` by default. Production does not |
| Vector logo | The 3D mark and share images are raster; a vector wordmark would sharpen the 1:1 image |
