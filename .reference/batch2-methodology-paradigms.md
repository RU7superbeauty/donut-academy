# Batch 2: Write 4 New Articles

Read `.reference/writing-rules.md` and `.reference/ai-trade-frontier.md` first.
Also read `src/pages/index.astro` for the landing page content to expand upon.

Write these 4 articles in `src/content/articles/`:

## Article 4: d0-design-principles.md
**Category**: D0 METHOD
**Title**: "The 5 Design Principles That Make D0 Agent-Native"
**Expand from**: Section 03 (Product Breakthrough Methodology) on landing page

Deep-dive into each of the 5 principles:
1. CLI-as-API — Why CLI > REST API for agents. LLMs are text machines, CLIs are text interfaces. Impedance match. Reference: sysls's article about "less is more" — basic CLI tools outperform complex harnesses.
2. Zero-Config Progressive Disclosure — Read layer needs nothing. Write layer needs a key. 80% functionality with 0% setup. Why this matters for agent bootstrapping.
3. Non-Custodial by Design — EIP-712 typed data signing. Key never leaves local machine. Architectural impossibility vs corporate promise. Post-FTX world.
4. Exchange Abstraction — Unifying Hyperliquid perps + Polymarket prediction markets under one command set. The semantic gap problem.
5. Composable Skill System — D0 as a Clawhub skill. Agent pipelines: News + Data + Analysis + D0 = autonomous trading.

Each principle gets: the problem it solves, the design decision, code example, why it matters for agents.

## Article 5: agent-to-agent-economy.md
**Category**: AI FRONTIER
**Title**: "Agent-to-Agent Economy: What Happens When AI Doesn't Need the GUI"
**Expand from**: Section 04 Paradigm 1 on landing page

Cover:
- The current human-in-the-loop model and why it's a bottleneck
- Agent coordination patterns: signal agent → strategy agent → execution agent → risk agent
- How agent-to-agent communication differs from API calls (intent-level vs parameter-level)
- The settlement layer question: who provides the execution infrastructure for agent networks?
- Reference P4 (market quality effects of bot participation) and H4 (ambiguous net effect) from frontier knowledge
- The Millennium Bridge effect: when all agents use the same strategy, markets break (reference Roan's article on portfolio theory)
- D0 as the settlement layer for agent networks

## Article 6: intent-centric-execution.md
**Category**: AI FRONTIER
**Title**: "Intent-Centric Execution: From '帮我抄底' to On-Chain Position"
**Expand from**: Section 04 Paradigm 2 on landing page

Cover:
- The spectrum of trading intent: explicit ("buy 0.1 ETH at 3200") vs ambiguous ("帮我搞点 ETH")
- Why intent parsing is an AI-complete problem for trading
- The confirmation loop design: when should the agent ask vs execute?
- Reference P7 (agent trading autonomy boundaries) and DR-001 from landing page
- Multi-step intent decomposition: "hedge my portfolio" requires understanding current positions, correlations, available instruments
- Natural language → structured trade → execution pipeline
- Bilingual examples (English + Chinese) since D0 serves both markets

## Article 7: realtime-risk-first-class.md
**Category**: AI FRONTIER
**Title**: "Real-Time Risk as First-Class Citizen: Why Every Trade Needs an Automatic Safety Check"
**Expand from**: Section 04 Paradigm 3 on landing page

Cover:
- Traditional risk management: afterthought, optional, human-monitored
- Embedded risk: pre-execution validation baked into every trade path
- The multi-gate framework (reference P3 and H3 from frontier knowledge): confidence gate × position gate × conflict gate
- Why agents need harder risk constraints than humans (no intuition, no fear, will size too aggressively)
- Reference H3: multi-gate frameworks becoming standard by Q4 2026
- Failsafe hierarchy: soft limits → hard stops → circuit breakers → human escalation
- Agent risk control failure modes: data latency, liquidity dry-up, cascade liquidation (tie to DR-003)
- Kelly criterion with calibration error adjustment

After writing all 4, commit: "feat: add 4 articles — methodology + paradigms 1-3"
Do NOT push.
