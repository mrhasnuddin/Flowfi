# 06 · Copy deck: what changed from the original

> Superseded in part by [08 · Rebuild to taiko.xyz's structure and motion](08-taiko-replication.md): type, button colour, section structure and motion values there are current.

Source: `git show 30e0b76:src/i18n.js`. Method: the humanize skill's rules (keep every fact, never invent, cut filler) plus brand V1 ("calm, no aggressive marketing language"). English first; Chinese follows the original translations wherever the English did not change.

Everything not listed here is word-for-word the original, including the headline "FlowFi is Capital, Governed.", "Web3 capital has scaled. Governance hasn't.", all section titles, the three phase names and statuses, the four card titles, and every number (1.2B FF, $10M+, 1 Billion FF, 50%).

## Polished

| Where | Original | Now | Why |
|---|---|---|---|
| Problem | Passive treasuries suffer from **non-productive stagnation**. Millions in community assets sit dormant because the tools for audited deployment don't exist. | Passive treasuries **stagnate**. Millions in community assets sit dormant because the tools for audited deployment don't exist. | Stagnation is already unproductive |
| Governance Treasury | …manages protocol parameters, voting weights, **and total FF consensus mechanisms**. | …manages protocol parameters, voting weights **and the FF consensus mechanism**. | "Total … mechanisms" did not parse. **Meaning assumed; confirm with the team** |
| Investor Treasury | …**drives aggressive, audited growth** through capital deployment and incubation. | …**grows capital through audited deployment** and incubation. | V1 bans aggressive marketing language |
| Economics intro | A deflationary, **high-impact** tokenomics framework **designed for** sustainable value capture and ecosystem growth. | A deflationary tokenomics framework **built for** sustainable value capture and ecosystem growth. | "High-impact" is promotion without a fact |
| Capped Supply | **Strictly capped** at 1 Billion FF. No inflation, no minting. **A finite resource for the infinite ecosystem.** | Capped at 1 Billion FF. No inflation, no minting. | The closing line is an aphorism with no information |
| Fair Launch | **100% Transparency.** The Black Hole Launch **ensures equal opportunity participation** with no VC pre-allocations. | **100% transparent.** The Black Hole Launch **gives everyone equal access**, with no VC pre-allocations. | Plain verbs |
| Ecosystem First | 50% allocated **fundamentally** to ecosystem incentives & builder grants. | 50% goes to ecosystem incentives and builder grants. | "Fundamentally" is filler |
| Deep Collateral | Over-collateralized ratio **ensuring** protocol solvency and stability. | An over-collateralized ratio **keeps the protocol solvent and stable**. | Participle tail replaced by a verb |
| Roadmap intro | FlowFi's roadmap **is not about trends. It is about the systemic transition** of capital to the ENI Mainnet. | The roadmap **moves capital to the ENI Mainnet in three phases.** | Negative parallelism; "systemic transition" says nothing. "Three phases" is a count of the original phases |
| Phase 01 | Black Hole Launch completion and **establishment of** the dual-vault consensus architecture. | **Completes** the Black Hole Launch and **sets up** the dual-vault consensus architecture. | Nominalisations to verbs |
| Phase 02 | **Integration of** automated revenue routing and multi-strategy investor treasury pools. | **Adds** automated revenue routing and multi-strategy investor treasury pools. | Same |
| Phase 03 | Standardized vault templates for Web2 **institutional migration** to ENI Mainnet. | Standardized vault templates for **moving Web2 institutions** to the ENI Mainnet. | Same |
| Join | …**participate in** governance, and automate your yield. | …**take part in** governance and automate your yield. | Smaller word, no serial comma |

## Dropped

| What | Why |
|---|---|
| "The Institutional Standard" (tag above the final section), "Development Path" (above the roadmap), the bracketed uppercase `[ Governance ]` / `[ Investor ]` | D5: no eyebrow tags. The two diagram labels survive as plain "Governance" and "Investor" callouts |
| The email field and "Subscribe" | D7: no endpoint. The field component is in the design system, ready |
| "Systems Operational" | No status feed behind it |
| "Core Features" (footer) | Nothing on the page defines it |

## New, and where it comes from

| String | Source |
|---|---|
| Hero sub-line | The original footer description, moved up unchanged |
| "View Architecture" | Interim button you approved (the app URL does not exist yet) |
| "View Treasury" (Investor screen button) | Replaces "View Portfolio". There is no portfolio page to go to |
| FF Token screen: "Capped Supply." and its sentence | Original Capped Supply card, plus "The Black Hole Launch distributes it" from the economics intro |
| "The dual-vault architecture." | The phrase appears in the original Phase 01 and call-to-action text |
| Audience tiles: "Explore Governance", "Read Tokenomics", "Read Whitepaper" | Original button and footer labels |
| 8 FAQ answers | Each restates a fact already on the page. Nothing added |
| "Soon" | Marks links with no URL yet |

## Needs an owner's check

- **"Is FlowFi audited? Yes. FlowFi is Certik audited."** This turns the original badge into a sentence, and the JSON-LD repeats it. Confirm it is true, link the audit report, then add the link.
- **"1.2B FF locked" and "$10M+ seed capital"** are original figures, untouched, and no source is cited on the page.
- **"ENI Mainnet".** The roadmap says capital is *moving* there. Do not describe it as live.
- **Chinese for every changed or new line** was written by me. A native reader should review it, especially the FAQ.

## Lint

`sloplint` (humanize skill) on the English strings longer than a sentence fragment: original **0/100**, now **9/100**, both "clean", no pattern findings. The original was never full of the usual tells, so the edits above are about brand fit and precision, not about AI vocabulary. The only patterns removed were one aphorism, one negative parallelism and a few participle tails.
