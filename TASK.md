# Donut Academy — Setup & First Articles

## Overview
Set up Donut Academy as an Astro static site with markdown-based articles. Write the first 3 articles.

**State note:** Astro scaffolding may already exist in this repo (astro.config.mjs, src/, node_modules/). If so, **do not re-init destructively**. Continue from current state and finish the remaining steps.

## Step 1: Astro Project Setup

Initialize Astro in this repo. Keep the existing `index.html` landing page content but integrate it into Astro.

### Requirements:
- `npm create astro@latest` — use the "empty" template, overwrite existing
- Install dependencies: `@astrojs/mdx`, `marked` or similar
- Vercel adapter for deployment
- Content collections for articles

### Project structure:
```
/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro    # Shared head, nav, footer
│   │   └── ArticleLayout.astro # Article page layout
│   ├── pages/
│   │   ├── index.astro         # Landing page (migrate from index.html)
│   │   └── articles/
│   │       └── index.astro     # Article listing page
│   ├── content/
│   │   └── articles/           # Markdown articles go here
│   └── styles/
│       └── global.css          # Design system from index.html
├── public/
│   ├── logo.jpg
│   ├── logo.png
│   └── logo-white.png
├── astro.config.mjs
└── package.json
```

### Design System (extract from index.html):
```css
--bg:      #0a0a0a;
--surface: #111111;
--card:    #0e0e0e;
--border:  #222222;
--border2: #333333;
--text:    #e8e8e8;
--text2:   #888888;
--muted:   #555555;
--accent:  #ACAAFF;    /* Brand purple */
--accent2: #c8c7ff;
--gold:    #FFE098;
--green:   #069742;
--red:     #f87171;
```
- Fonts: Bebas Neue (headings), Space Mono (data/code), Noto Sans SC (body)
- Tone: dark, technical, data-dense, no rounded corners, no gradients
- Scanline overlay effect on body

### Article Layout Features:
- Article metadata in frontmatter: title, subtitle, date, author, category, tags, description
- Category badges: "AI FRONTIER" (purple), "D0 METHOD" (gold), "RESEARCH" (green)
- Reading time estimate
- Table of contents (auto-generated from h2/h3)
- Code blocks with syntax highlighting
- Blockquote styling for key insights (left border accent)
- Formula/equation display (monospace blocks)
- Back to article list link
- Previous/Next article navigation

### Article Listing Page:
- Grid of article cards
- Filter by category
- Each card shows: category badge, title, date, reading time, description snippet

## Step 2: Write 3 Articles

Write articles as markdown files in `src/content/articles/`. Each article should be:
- 2000-4000 words (substantial, not thin content)
- Written in English (primary) with occasional Chinese terms where natural
- Style: like Roan (@RohOnChain) and sysls (@systematicls) — break down complex concepts with practical mappings, personal voice, strong structure with numbered phases/sections
- Heavy use of formulas, code examples, real data where applicable
- End with a clear takeaway/call-to-action

### Article 1: "Why AI Agents Will Execute 90% of On-Chain Trades by 2029"
**Category**: AI FRONTIER
**File**: `agent-economy-thesis.md`

Core argument: The transition from human-click trading to agent-executed trading is inevitable, and whoever owns the agent execution layer owns the flow.

Structure:
- Phase 1: The current state — how trading works today (humans clicking GUIs, copy-trading, simple bots)
- Phase 2: Why LLMs change everything — intent parsing, multi-step reasoning, real-time risk assessment
- Phase 3: The execution layer gap — existing tools aren't built for agents (REST APIs designed for human developers, not autonomous systems)
- Phase 4: Agent-to-Agent economy — when agents trade with each other, the middleman GUI disappears entirely
- Phase 5: What this means for infrastructure builders

Key knowledge to incorporate:
- CLI-as-API design philosophy (D0's approach: CLI is the API, agents call commands like humans)
- Zero-config progressive disclosure (80% of features work without setup)
- Non-custodial by design (EIP-712 local signing)
- Exchange abstraction (unified semantics across Hyperliquid, Polymarket)
- The composable skill system (D0 as a Clawhub skill, combinable with other skills)

### Article 2: "LLM Probability Calibration: Can AI Actually Price Risk?"
**Category**: RESEARCH
**File**: `llm-probability-calibration.md`

Core argument: LLMs are systematically miscalibrated on tail probabilities, and understanding this bias is the key to building profitable prediction market agents.

Structure:
- Phase 1: What calibration means — if you say 70%, it should happen 70% of the time
- Phase 2: The empirical evidence — studies showing LLM calibration performance
  - Zou et al. (2022): LMs approach human forecasters on Metaculus but gap widens on tail events
  - GPT-4 calibration studies: systematic deviation on rare events
  - Metaculus AI experiments: LLMs underperform calibrated human ensembles on extremes
- Phase 3: The favorite-longshot bias connection — Snowberg & Wolfers (2010) showed misperception dominates, longshots are overpriced
  - This maps directly: if LLMs inherit human biases, they overestimate low-probability events
- Phase 4: Practical implications for trading agents
  - Multi-gate risk framework: confidence × position sizing × conflict detection
  - The half-life problem: news alpha decays in <4 hours in liquid markets
  - Walk-forward backtesting is non-optional (Bailey et al. 2015: standard splits overestimate by 30-60%)
- Phase 5: Building a calibrated trading pipeline
  - Step 1: estimate probability → Step 2: compare to market price → Step 3: size position with Kelly criterion → Step 4: risk gates before execution

Key knowledge to incorporate:
- P1 (LLM calibration), H1 (tail miscalibration), H5 (favorite-longshot exploitation)
- B1 (Lopez-Lira GPT-4 stock prediction), B4 (Zou forecasting), B5 (Snowberg favorite-longshot), B6 (Bailey backtest overfitting)

### Article 3: "The Agentic Trading Stack: From Intent to On-Chain Settlement"
**Category**: D0 METHOD
**File**: `agentic-trading-stack.md`

Core argument: The future trading stack has 5 layers, and most existing tools only cover 1-2. D0 is built to be the missing execution layer.

Structure:
- Phase 1: The 5-layer stack
  - Layer 1: Intent (natural language) — "buy ETH when it dips 5%"
  - Layer 2: Understanding (AI parse) — intent recognition, parameter extraction
  - Layer 3: Strategy (routing + risk) — which exchange, what size, risk checks
  - Layer 4: Execution (D0 CLI) — signing, broadcasting, confirmation
  - Layer 5: Settlement (on-chain) — verification, state update
- Phase 2: Why existing tools fail
  - CEX APIs: designed for human developers, not agents. REST + auth tokens + rate limits
  - DeFi frontends: GUI-first, agent-hostile
  - Existing bots (freqtrade etc.): strategy-focused but no agent integration layer
- Phase 3: CLI-as-API — the design insight
  - Why CLI is the natural interface for AI agents
  - Zero-config philosophy: read operations need no setup
  - Progressive complexity: simple commands → complex strategies
- Phase 4: Non-custodial execution
  - EIP-712 signing explained simply
  - Why "trust the math, not the promise" matters
  - Local key management for agents
- Phase 5: Exchange abstraction
  - The semantic gap: Hyperliquid perpetuals vs Polymarket prediction markets
  - How D0 unifies different protocols under one command set
  - Agent doesn't need to know which chain it's on
- Phase 6: The composable future
  - D0 as a skill in a larger agent ecosystem
  - Trading skill + data skill + news skill = autonomous pipeline
  - Multi-agent coordination patterns

Key knowledge to incorporate:
- D0's 5 product principles from the landing page
- Architecture diagram: INTENT → AI PARSE → STRATEGY → D0 CLI → ON-CHAIN
- Read/Write/Strategy layer separation
- Agent-first design philosophy

## Step 3: Git Operations (PR-based review)

**Important:** Ru7 will review + merge via GitHub PR. Do **NOT** push directly to `main`.

After writing everything:
1. Add a `.gitignore` that excludes at least: `node_modules/`, `dist/`, `.astro/`, `.vercel/`
2. Create a branch: `git checkout -b feat/astro-and-initial-articles`
3. `git add -A`
4. `git commit -m "feat: initialize Astro project + first 3 articles"`
5. `git push -u origin feat/astro-and-initial-articles`
6. Print instructions for opening a PR (or use `gh pr create` if available).

PR title: `feat: Astro + first 3 articles`
PR reviewers: Ru7 + Fei (Slack reviewer id: U0AC9E544MA)

## Quality Checklist:
- [ ] `npm run build` passes without errors
- [ ] Landing page looks identical to original
- [ ] Article pages render correctly with full design system
- [ ] All 3 articles are substantial (2000+ words each)
- [ ] Code blocks, formulas, and blockquotes render properly
- [ ] Mobile responsive
- [ ] Category filtering works on article listing page
