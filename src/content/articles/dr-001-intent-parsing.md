---
title: "DR-001: The Accuracy Boundary of AI Trading Intent Parsing"
subtitle: "When an LLM misinterprets 'buy the dip' as a market order for DIP token, the consequences are measured in lost capital."
date: "2026-03-07"
author: "Donut Research"
category: "RESEARCH"
tags: ["Intent Parsing", "NLP", "Safety", "Agent Autonomy", "DR-001"]
description: "A research analysis of how LLMs parse ambiguous trading instructions into executable parameters, the error taxonomy that emerges, and design patterns for keeping misexecution rates below catastrophic thresholds."
---

"Buy some ETH when it looks cheap."

That sentence contains at least five unresolved parameters: What counts as "some"? 0.01 ETH or 10 ETH? What does "cheap" mean — a 5% dip from today's price, or a return to last month's low? Buy on which exchange? As a market order or limit? With what stop-loss?

A human trader reading this instruction would ask clarifying questions. A reckless AI agent would guess. A well-designed AI agent would do something in between — resolve what it can, flag what it can't, and execute only when the ambiguity drops below a threshold that the user has accepted.

This is the intent parsing problem, and it sits at the most dangerous intersection in AI-native trading: the gap between what a user *means* and what an agent *does*. Get it right, and you've built a system that makes trading as natural as conversation. Get it wrong, and you've built a system that turns vague statements into irreversible financial losses.

## Phase 1: The Ambiguity Spectrum

Trading instructions exist on a spectrum from fully specified to deeply ambiguous. The key insight is that ambiguity isn't binary — it's multi-dimensional. An instruction can be precise about the asset but vague about size, or clear about the action but ambiguous about timing.

Here's the spectrum, with examples:

**Level 1 — Fully specified (machine-executable)**
```
Buy 0.5 ETH at market price on Hyperliquid with a 5% stop-loss
```
Every parameter is explicit. The agent can execute without interpretation. No parsing risk.

**Level 2 — Partially specified (resolvable with defaults)**
```
Buy 0.5 ETH on Hyperliquid
```
Missing: order type (infer market), stop-loss (apply default). The agent can fill gaps from sensible defaults, but must make those defaults visible to the user.

**Level 3 — Underspecified (requires inference)**
```
Buy some ETH
```
Missing: size, exchange, order type, risk parameters. "Some" requires the agent to infer a reasonable size from context — the user's portfolio size, typical position sizes, risk tolerance. Every inference is a potential error.

**Level 4 — Colloquial (requires semantic interpretation)**
```
帮我搞点 ETH
```
"搞点" (get some) is colloquial Mandarin with no inherent financial precision. The agent must (1) identify the language, (2) map colloquial phrasing to a trading action, (3) infer all missing parameters. Error surface is large.

**Level 5 — Conditional and abstract (requires world modeling)**
```
Hedge my exposure when macro looks weak
```
This requires the agent to understand what the user's current exposure is, define "macro looks weak" in terms of observable signals (VIX level? treasury yields? PMI data?), determine the appropriate hedging instrument, and compute the hedge ratio. Each step introduces compounding uncertainty.

The critical observation: the further down this spectrum you go, the more the agent's interpretation diverges from the user's intent. And in trading, divergence means losses.

## Phase 2: The Five Dimensions of Intent Parsing

Every trading instruction, regardless of ambiguity level, must resolve to the same set of executable parameters. We've identified five core dimensions that an intent parser must extract:

### Dimension 1: Asset Identification

**The problem**: Natural language references to financial assets are ambiguous. "BTC" is unambiguous. "Bitcoin" is nearly unambiguous. "Corn" might mean $CORN token, corn futures, or Bitcoin (crypto slang). "The big one" could mean BTC, ETH, or whatever the speaker considers the primary asset.

**Failure modes**:
- **Ticker collision**: Multiple assets share the same colloquial name. "SOL" is Solana, but also could refer to solar energy stocks in traditional finance.
- **Slang misinterpretation**: "Buy the dip" parsed as a purchase order for a token called DIP (which exists).
- **Cross-language ambiguity**: "以太" (Yitai) is Chinese for Ethereum, but a model trained primarily on English might not recognize it as an asset reference.

Asset identification has a relatively bounded error space — the set of tradeable assets on supported exchanges is finite and enumerable. The harder problem is when the user references an asset concept rather than a specific asset: "something correlated with ETH but cheaper" requires the agent to know correlation structures.

### Dimension 2: Action Type

**The problem**: The universe of trading actions extends far beyond buy/sell. Open a long position, close a short, add to an existing position, reduce exposure, set a limit order, cancel an existing order, roll a position to a different expiry.

**Failure modes**:
- **Open vs. close confusion**: "Get out of ETH" — does this mean sell a long position, or close a short position, or both?
- **Relative vs. absolute**: "Double my position" requires knowing the current position size. If the agent's state tracking is stale, it doubles the wrong base.
- **Implicit actions**: "I'm worried about ETH" — is this a request to hedge, reduce, or just a statement? Interpreting worry as a sell signal would be catastrophic if the user was seeking reassurance, not action.

### Dimension 3: Size Inference

**The problem**: Position sizing is the dimension with the highest stakes for misinterpretation. "Buy some" could mean $10 or $10,000 depending on the user's portfolio and risk tolerance.

**Failure modes**:
- **Scale misinterpretation**: The user says "a small amount" with a $1M portfolio. The agent interprets "small" as $100 (correct for a $10K portfolio) instead of $10,000.
- **Unit confusion**: "Buy 1 ETH" vs "Buy $1 of ETH" vs "Buy 1% of my portfolio in ETH." Each uses "1" to mean something completely different.
- **Leverage opacity**: "Buy $10K of ETH" — spot or 10x leveraged perpetual? The risk difference is an order of magnitude.

Size errors are uniquely dangerous because they compound with all other errors. If the agent gets the asset wrong and the size small, the damage is bounded. If it gets the asset wrong and the size large, the damage is catastrophic.

### Dimension 4: Condition Extraction

**The problem**: Many trading instructions are conditional — execute *if* something happens. Parsing conditions requires temporal reasoning, threshold identification, and trigger mechanism design.

**Failure modes**:
- **Vague thresholds**: "Buy when it's cheap" — cheap relative to what? Current price? 30-day average? All-time high?
- **Temporal ambiguity**: "Buy ETH next week" — at market open Monday? Anytime during the week? At the week's lowest price?
- **Compound conditions**: "Buy ETH if BTC holds $60K and the funding rate goes negative" — both conditions must be monitored simultaneously, and the order of evaluation matters if they flip back and forth.

### Dimension 5: Risk Parameter Derivation

**The problem**: Users almost never specify risk parameters explicitly. They say "buy ETH" but not "with a 3% stop-loss, maximum 2x leverage, position size capped at 5% of portfolio, and a take-profit at 10%." Yet these parameters are what determine whether the trade is safe or suicidal.

**Failure modes**:
- **Missing stop-loss**: The most common and most dangerous omission. An agent that executes without a stop-loss exposes the user to unlimited downside on leveraged positions.
- **Implicit leverage**: On Hyperliquid, the default leverage may differ from what the user expects. The agent must either confirm leverage or apply a conservative default.
- **Risk budget ignorance**: The agent executes a new position without considering existing exposure. The individual trade is reasonable, but the combined portfolio is now 80% concentrated in a single correlated bet.

## Phase 3: The Confirmation Loop Problem

The naive solution to intent ambiguity is obvious: always confirm. Ask the user to verify every parameter before execution. But this solution has a fatal flaw — it destroys the value proposition of autonomous agents.

If every trade requires full parameter confirmation, the agent is no better than a structured order form. The entire point of natural language trading is to reduce friction. "Buy some ETH" should be *easier* than filling out an order ticket, not harder.

This is the confirmation loop problem, and it maps directly onto what the AI agent safety literature calls the **clarification vs. delegation tension** (related to open problem P7 in AI trade research — agent trading autonomy boundaries). The agent must decide, for each instruction, whether to:

1. **Execute autonomously** — infer all parameters and trade immediately
2. **Confirm with the user** — present the interpreted parameters and wait for approval
3. **Refuse and request clarification** — ask for missing information before proceeding

The correct decision depends on two variables: the **confidence of the parse** and the **stakes of the execution**.

```
                    HIGH STAKES
                        |
    ALWAYS CONFIRM      |      CONFIRM + EXPLAIN
    (uncertain parse,   |      (confident parse,
     high stakes)       |       high stakes)
                        |
    ────────────────────┼────────────────────
                        |
    CLARIFY FIRST       |      AUTO-EXECUTE
    (uncertain parse,   |      (confident parse,
     low stakes)        |       low stakes)
                        |
                    LOW STAKES

    LOW CONFIDENCE ─────────── HIGH CONFIDENCE
```

**Auto-execute zone** (high confidence, low stakes): "Check the price of ETH" — no ambiguity, no financial risk. Execute immediately.

**Confirm + explain zone** (high confidence, high stakes): "Buy 1 ETH at market" — the parse is unambiguous, but the financial commitment is significant. Present the interpreted order with computed risk parameters and wait for a single "yes."

**Always confirm zone** (low confidence, high stakes): "Hedge my portfolio" — the agent doesn't know what the user considers a proper hedge, and the financial implications are large. Full parameter confirmation required.

**Clarify first zone** (low confidence, low stakes): "Get me some of that coin someone was talking about" — the agent literally cannot determine the asset. Clarification is required before any action.

### The Progressive Confirmation Pattern

Rather than a binary confirm/don't-confirm, the most effective pattern is **progressive confirmation** — a multi-step flow where the agent resolves ambiguity incrementally:

```
User: "Buy some ETH when it dips"

Agent: "I'll set up a limit buy for ETH. Let me confirm the details:
  • Asset: ETH/USDC on Hyperliquid
  • Action: Limit buy
  • Size: 0.1 ETH (~$350, approximately 2% of your portfolio)
  • Trigger: 3% below current price ($3,395 → $3,293)
  • Stop-loss: 5% below entry ($3,128)

  Shall I place this order?"
```

This preserves the natural language interface while making the interpretation explicit. The user can approve the full order with a single confirmation, or correct any individual parameter.

The key design decisions in this pattern:

1. **Show the reasoning.** Don't just present numbers — explain why. "2% of your portfolio" tells the user how the agent derived the size.
2. **Apply conservative defaults.** When in doubt, default to smaller sizes, tighter stops, and lower leverage. Users are much more forgiving of an agent that's too cautious than one that's too aggressive.
3. **Include computed risk parameters.** Even if the user didn't mention a stop-loss, show one. This surfaces implicit risk that the user may not have considered.
4. **Make correction easy.** "Change size to 0.5 ETH" should be parseable without re-specifying the entire order.

## Phase 4: The Error Taxonomy

Not all parsing errors are equally dangerous. An error taxonomy helps prioritize what the system must get right versus what's acceptable to get approximately right.

**Category A — Catastrophic errors (must be zero-tolerance)**

- **Wrong direction**: Buying when the user meant to sell (or vice versa). This is the worst possible parsing error because it doubles the intended exposure in the wrong direction.
- **Wrong asset**: Executing on the wrong token/contract. Particularly dangerous when the wrong asset is illiquid — the position may be impossible to exit without massive slippage.
- **Order of magnitude size error**: Buying 10 ETH when the user meant 0.1 ETH, or interpreting "$100" as "100 ETH."

These errors require zero tolerance because they can result in immediate, large, irreversible losses. The system must be designed so that these error categories trigger mandatory confirmation regardless of the confidence level.

**Category B — Serious errors (minimize through defaults)**

- **Missing stop-loss**: Not catastrophic immediately, but exposes the user to tail risk. Solvable with mandatory default stop-losses.
- **Wrong order type**: Placing a market order when the user expected a limit order. Results in worse execution price but not directional error.
- **Leverage miscalculation**: Trading at 5x when the user expected 2x. Amplifies both gains and losses.

These errors should be caught by the confirmation flow for any trade above the auto-execute threshold.

**Category C — Suboptimal execution (acceptable with correction)**

- **Imprecise timing**: Executing at 3:00 PM when the user vaguely intended "end of day."
- **Exchange routing**: Executing on Hyperliquid when Polymarket would have been more appropriate for the specific instrument.
- **Slight size variance**: Buying 0.095 ETH instead of 0.1 ETH due to lot sizing constraints.

These are operational inefficiencies, not errors. They should be logged and visible to the user for correction, but don't warrant blocking execution.

## Phase 5: Design Patterns for Safe Intent Parsing

Based on the error taxonomy, several design patterns emerge for building intent parsing systems that keep error rates below acceptable thresholds:

### Pattern 1: Dry Run Mode

Before any real execution, the agent runs the parsed intent through a simulation layer. The dry run produces:

- The exact order parameters that would be submitted
- The estimated execution price and fees
- The impact on portfolio risk metrics
- Any risk limit violations

The user sees the dry run output and can approve, modify, or cancel. This pattern adds one round-trip of latency but eliminates Category A errors entirely.

### Pattern 2: Graduated Autonomy

New users start with full confirmation on every trade. As the system builds confidence in its understanding of the user's patterns, the confirmation threshold rises:

- **Week 1**: Confirm everything above $0
- **Month 1**: Auto-execute below $50, confirm above
- **Month 6**: Auto-execute below 2% of portfolio, confirm above
- **Custom**: User sets their own threshold

The graduation is based on *demonstrated accuracy*, not elapsed time. If the system makes a parsing error, the autonomy level drops back down.

### Pattern 3: Undo Capability

For non-leveraged spot trades, the agent can offer a time-limited undo window (e.g., 30 seconds). This doesn't prevent errors but dramatically reduces their cost. The user sees:

```
Executed: Bought 0.1 ETH at $3,402
[UNDO - 28 seconds remaining]
```

This is only possible on exchanges with sufficient liquidity and low fees. On prediction markets with wide spreads, the undo cost may be prohibitive.

### Pattern 4: Semantic Guardrails

Hard-coded rules that override the LLM's interpretation regardless of confidence:

- **Maximum single trade size**: Never exceed X% of portfolio in a single order, no matter what the user says
- **Leverage caps**: Never apply leverage above a user-configured maximum
- **Asset whitelist**: Only trade assets on a user-approved list
- **Mandatory stop-loss**: Every leveraged position must have a stop-loss, inferred if not specified

These guardrails function as a safety net below the intent parser. Even if the parser catastrophically fails, the guardrails prevent the worst outcomes.

## Phase 6: The Acceptable Error Rate Question

In software engineering, a 99% accuracy rate is often considered excellent. In financial execution, 99% accuracy means 1 out of every 100 trades is wrong. If you're making 10 trades per day, that's a misexecution every 10 days. If a single misexecution can lose 5% of your portfolio, you lose roughly half your capital per year from errors alone.

The acceptable error rate for AI trading intent parsing depends on the stakes:

- **Category A errors** (wrong direction, wrong asset, magnitude error): Must be below **0.01%** — less than 1 in 10,000 trades. This is achievable only with mandatory confirmation on all trades above a size threshold.
- **Category B errors** (missing stops, wrong leverage): Must be below **0.1%** — less than 1 in 1,000. Achievable with conservative defaults and confirmation on leveraged trades.
- **Category C errors** (suboptimal execution): Below **5%** is acceptable, as these are correctable inefficiencies, not losses.

The multi-gate approach — dry run, confirmation on high-stakes trades, semantic guardrails — can achieve these thresholds. But it requires accepting that fully autonomous, confirmation-free trading is only safe for a narrow band of low-stakes, high-confidence instructions.

> The uncomfortable truth about AI trading intent parsing: the harder you push toward full autonomy, the closer you get to a system where a single ambiguous instruction can cause irreversible financial damage. The design challenge is not making the parser smarter — it's making the system safe even when the parser is wrong.

## What This Means for D0

D0's architecture addresses intent parsing at multiple layers:

- **CLI-as-API** provides a structured command grammar (`d0 buy ETH 0.1 --exchange hyperliquid --stop-loss 5%`) that agents can generate, bypassing natural language ambiguity for machine-to-machine calls
- **Progressive confirmation** surfaces the agent's interpretation before execution, catching parse errors before they become trades
- **Non-custodial execution** means even a misexecuted trade can be reversed by the user (close the position), because the user retains full control of their wallet
- **Risk layer as pre-execution check** catches Category B errors (missing stops, excessive leverage) regardless of the parser's output

The intent parsing problem won't be fully solved by better LLMs alone. It requires a systems-level approach: structured fallbacks, conservative defaults, graduated autonomy, and the humility to confirm when uncertain. The agent that asks "did you mean X?" is always safer than the agent that assumes "you must have meant X" — even if the question adds friction. In finance, friction is a feature.
