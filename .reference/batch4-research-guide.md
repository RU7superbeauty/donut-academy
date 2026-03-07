# Batch 4: Write 4 New Articles

Read `.reference/writing-rules.md` and `.reference/ai-trade-frontier.md` first.
Also read `src/pages/index.astro` for the landing page content to expand upon.

Write these 4 articles in `src/content/articles/`:

## Article 12: dr-004-multi-agent-game-theory.md
**Category**: RESEARCH
**Title**: "DR-004: Multi-Agent Alpha Decay and the Game Theory of AI Traders"
**Expand from**: DR-004 on landing page

Cover:
- The alpha decay problem: when multiple agents discover the same signal, they all trade it, and the edge disappears
- Concrete example: funding rate arbitrage on perpetual exchanges. When 100 bots all do the same arb, funding rates compress to zero profit
- Game theory fundamentals applied: Nash equilibrium in repeated trading games
- The information compression hypothesis: AI agents compress information asymmetry faster than humans, accelerating alpha decay
- Reference P4 (market quality effects of bot participation) and H4 (ambiguous net effect) from frontier knowledge
- Reference B7 (Menkveld HFT market makers) — HFT reduced spreads but imposed adverse selection costs. Same dynamic applies to agent trading.
- Strategy diversification as defense: agents that combine multiple uncorrelated signals decay slower
- The Millennium Bridge analogy (from Roan's article): when everyone walks in sync, the bridge oscillates. When all agents trade the same strategy, markets become fragile.
- Open question: will AI trading lead to more efficient markets (good) or more synchronized crashes (bad)?

## Article 13: dr-005-mm-pattern-detection.md
**Category**: RESEARCH
**Title**: "DR-005: On-Chain Behavioral Fingerprinting — Detecting Market Maker Patterns"
**Expand from**: DR-005 on landing page

Cover:
- Market makers leave identifiable patterns on-chain: order placement timing, size distribution, price level selection
- Two pattern types from the landing page: C-type (阶梯拉盘, staircase pump) and E-type (掩护出货, cover distribution)
- Reference B8 (Cong et al. crypto wash trading) — behavioral fingerprinting methodology that found 70-80% artificial volume on unregulated exchanges
- Reference B15 (Dune Analytics / Chaos Labs) — quantifying bot market share on Polymarket
- Detection methodology: cluster wallet behaviors by timing, size, and direction patterns
- Real-time vs post-hoc detection: the latency-accuracy tradeoff
- Reference P5 (real-time anomaly detection) — no production system exists yet for automated real-time PM detection
- Case studies from frontier knowledge: GTA VI event showed detectable insider pattern, Hegseth ban event had suspicious pre-announcement trading
- Feature engineering for MM detection: order-to-trade ratio, cancel rate, spread contribution, information toxicity
- The adversarial challenge: MMs will adapt once detection systems exist — arms race dynamics

## Article 14: quant-framework-crypto.md
**Category**: AI FRONTIER
**Title**: "The Quantitative Framework for AI-Powered Crypto Trading"
**Style**: Like Roan's MIT quant course article — break down quantitative concepts and map them to crypto/prediction market trading

Cover (6 phases):
- Phase 1: Probability and calibration — Brier scores, ECE, why calibration matters more than accuracy for trading
  - Reference H1 (LLM tail miscalibration) and B4 (Zou et al. forecasting)
- Phase 2: Position sizing — Kelly criterion, fractional Kelly, why full Kelly is "theoretically optimal but practically suicidal"
  - Formula: f* = (bp - q) / b, worked examples
- Phase 3: The favorite-longshot bias — Reference B5 (Snowberg & Wolfers 2010), why longshots are overpriced due to misperception not risk-love
  - Reference H5 (reliable but low-frequency alpha)
- Phase 4: Backtesting methodology — Reference B6 (Bailey et al. 2015), probability of backtest overfitting
  - Walk-forward validation, regime-aware splits, reference H6 (30-60% overestimation from standard splits)
- Phase 5: Market microstructure — Reference B7 (Menkveld HFT), how bot participation changes market quality
  - Liquidity provision vs toxic flow extraction, reference H4
- Phase 6: Risk management — Multi-gate frameworks, defense-in-depth, reference P3 and H3
  - Why agents need harder constraints than humans

## Article 15: building-agentic-pipeline.md
**Category**: D0 METHOD
**Title**: "Building Your First Agentic Trading Pipeline: A Practical Guide"

Cover:
- Step-by-step guide to constructing an agent trading pipeline
- Step 1: Data layer — price feeds, on-chain metrics, news. D0 read commands for market data.
- Step 2: Signal generation — how to structure LLM prompts for trading signals. Chain-of-thought prompting for better calibration.
- Step 3: Risk assessment — the multi-gate framework in practice. Implementing confidence, position, and conflict gates.
- Step 4: Execution — D0 CLI commands. From simple buys to leveraged positions with stops.
- Step 5: Monitoring — position tracking, P&L calculation, alert thresholds
- Step 6: Feedback loop — logging predictions, tracking outcomes, recalibrating
- Code examples throughout (bash + pseudocode)
- Common mistakes: over-sizing positions, no stop-loss, ignoring correlation, backtesting without walk-forward
- The composable approach: each step as an independent skill that can be upgraded separately

After writing all 4, commit: "feat: add 4 articles — DR-004, DR-005, quant framework, pipeline guide"
Do NOT push.
