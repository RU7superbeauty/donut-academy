# Batch 3: Write 4 New Articles

Read `.reference/writing-rules.md` and `.reference/ai-trade-frontier.md` first.
Also read `src/pages/index.astro` for the landing page content to expand upon.

Write these 4 articles in `src/content/articles/`:

## Article 8: verifiable-transparency.md
**Category**: AI FRONTIER
**Title**: "Verifiable Strategy Transparency: Replacing Trust With On-Chain Proof"
**Expand from**: Section 04 Paradigm 4 on landing page

Cover:
- The "black box quant" trust problem — hedge funds ask "trust us", blow up anyway
- On-chain verifiability: every agent trade is a public record
- Open-source strategy logic: anyone can audit what the agent does
- The difference between transparency and exploitability (sharing logic doesn't kill alpha if alpha comes from speed + calibration, not secrecy)
- Prediction market case study: Polymarket positions are fully visible on-chain. Reference B8 (Cong et al. crypto wash trading) and B15 (Dune dashboards) from frontier knowledge
- Non-custodial as a prerequisite for trustless execution
- The future: strategy NFTs, auditable agent track records, on-chain reputation

## Article 9: dr-001-intent-parsing.md
**Category**: RESEARCH
**Title**: "DR-001: The Accuracy Boundary of AI Trading Intent Parsing"
**Expand from**: DR-001 on landing page

Structure as a research-style article:
- Problem statement: LLMs must parse ambiguous trading instructions into precise executable parameters
- The ambiguity spectrum: "buy ETH" vs "帮我搞点 ETH" vs "hedge my exposure when macro looks weak"
- Key dimensions of intent parsing: asset identification, action type, size inference, condition extraction, risk parameter derivation
- The confirmation loop problem: reference P7 (agent trading autonomy boundaries) and proactive-agents AFR-BET-2 (clarification vs delegation tension)
- Error taxonomy: wrong asset, wrong size, wrong direction, missing stop-loss, misinterpreted conditions
- Design patterns: progressive confirmation (high-risk = always confirm, low-risk = auto-execute), undo capability, dry-run mode
- Open question: what's the acceptable error rate? In finance, even 1% misexecution is catastrophic

## Article 10: dr-002-cross-protocol-semantics.md
**Category**: RESEARCH
**Title**: "DR-002: Cross-Protocol Unified Execution Semantics"
**Expand from**: DR-002 on landing page

Cover:
- The semantic gap: Hyperliquid perpetual contracts vs Polymarket binary outcomes vs DEX spot swaps
- Concrete differences: order types, settlement mechanics, fee structures, position representation
- Why a naive "wrapper" doesn't work — each protocol has unique features that must be preserved
- Abstraction layer design: find the common semantics (asset, direction, size, risk) while allowing protocol-specific extensions
- The command grammar approach: `d0 buy ETH 0.1 --exchange hyperliquid` vs `d0 buy "Event outcome" 50 --exchange polymarket`
- How new protocols get added without breaking existing agent code
- Testing challenge: how do you verify semantic equivalence across protocols?
- Reference the exchange abstraction table from the landing page's architecture section

## Article 11: dr-003-risk-failure-modes.md
**Category**: RESEARCH
**Title**: "DR-003: How Agent Risk Controls Fail Under Black Swan Events"
**Expand from**: DR-003 on landing page

Cover:
- The three failure modes: data latency, liquidity evaporation, cascade liquidation
- Data latency: agent's risk model uses stale prices during flash crashes. By the time updated data arrives, position is already underwater. Oracle delay ≠ market delay.
- Liquidity evaporation: stop-loss orders can't execute when order book is empty. The 2020 March 12 "Black Thursday" in DeFi: MakerDAO liquidations at $0 because nobody was bidding
- Cascade liquidation: agent A's stop triggers → pushes price down → agent B's stop triggers → pushes price further → cascading failure
- Reference P3 (multi-gate risk framework) and H3 (multi-gate becoming standard)
- Failsafe hierarchy design:
  1. Soft limits (warnings, size reduction)
  2. Hard stops (absolute price levels, non-cancellable)
  3. Circuit breakers (pause all trading if drawdown > X%)
  4. Human escalation (alert human operator for manual intervention)
- Reference B9 (Almgren & Chriss optimal execution) — market impact modeling matters in crisis
- The unsolved problem: how do you test for black swans you haven't seen?

After writing all 4, commit: "feat: add 4 articles — paradigm 4 + DR-001 to DR-003"
Do NOT push.
