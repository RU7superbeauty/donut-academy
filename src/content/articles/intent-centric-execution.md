---
title: "Intent-Centric Execution: From '帮我抄底' to On-Chain Position"
subtitle: "Trading intent ranges from surgical ('buy 0.1 ETH at 3200') to vague ('帮我搞点 ETH'). Parsing that spectrum is an AI-complete problem. Here's how it works — and where it breaks."
date: "2026-03-07"
author: "Donut Research"
category: "AI FRONTIER"
tags: ["Intent Parsing", "NLP", "Trading", "D0", "Agent Safety"]
description: "How AI agents parse the full spectrum of trading intent — from explicit orders to ambiguous natural language — and the confirmation loop design that keeps users safe when parsing fails."
---

"帮我抄底。"

Two Chinese characters that mean "help me buy the dip." Simple enough for any human trader to understand. Catastrophically ambiguous for a trading agent. Buy what? Which asset? At what price — current price, or wait for a further dip? How much? With leverage? What's the stop-loss? On which exchange?

A single natural language sentence can contain anywhere from 2 to 15 implied parameters that the agent must resolve before executing. The gap between what the user said and what the execution engine needs is the intent gap — and bridging it is arguably the hardest unsolved problem in agent-assisted trading.

This is Donut Research topic DR-001: the accuracy boundary of AI agent trading intent parsing. This article maps the problem space, the current state of solutions, and the design patterns that make intent-centric execution safe enough for real capital.

## Phase 1: The Intent Spectrum

Trading intent isn't binary (clear vs unclear). It's a continuous spectrum from fully specified to completely ambiguous:

```
EXPLICIT ◄────────────────────────────────────────► AMBIGUOUS

Level 1: "Buy 0.1 ETH at 3200 USDC limit on Hyperliquid"
         → Every parameter specified. Direct execution.

Level 2: "Long ETH 1.5x with a 5% stop"
         → Action + asset + leverage + risk clear.
         → Missing: size, price type, venue.

Level 3: "Buy some ETH, it looks oversold"
         → Action + asset clear. Reasoning provided.
         → Missing: size, price, leverage, stop, venue.

Level 4: "帮我搞点 ETH" / "Get me some ETH"
         → Only action + asset implied.
         → Everything else must be inferred or asked.

Level 5: "帮我抄底" / "Buy the dip for me"
         → Only action implied. Asset unclear.
         → "The dip" requires market state analysis.

Level 6: "Hedge my portfolio"
         → High-level intent. Requires understanding current
            positions, correlations, available instruments.
         → Zero parameters are directly extractable.
```

Each level requires progressively more inference from the agent. At Level 1, parsing is trivial — extract named parameters and map to an order. At Level 6, the agent must understand the user's full portfolio state, compute correlations, identify appropriate hedging instruments, determine sizing, and construct multiple orders.

The critical question is: at what ambiguity level should the agent execute vs ask for confirmation?

## Phase 2: Why Intent Parsing Is AI-Complete for Trading

Intent parsing in trading isn't just NLP. It's NLP plus financial reasoning plus risk awareness plus user modeling. Here's why each component matters:

**NLP layer — understanding what was said:**

```
Input: "ETH 下跌 5% 的时候帮我抄底"
       "Help me buy the dip when ETH drops 5%"

Parse:
  action: buy
  asset: ETH
  trigger: price_drop
  trigger_magnitude: 5%
  trigger_reference: current_price (implied)
  order_type: conditional (implied — not immediate)
```

The NLP layer must handle:
- Bilingual input (D0 serves both English and Chinese markets)
- Slang and idioms ("抄底" = buy the dip, "梭哈" = all-in, "割肉" = cut losses)
- Implicit parameters (5% from current price, not from some other reference)
- Temporal intent (this is a conditional order, not an immediate one)

**Financial reasoning layer — understanding what was meant:**

```
User says: "Hedge my portfolio"

Agent must determine:
  1. Current positions: Long 2.0 ETH, Long 0.5 BTC
  2. Correlations: ETH-BTC ≈ 0.75 (high correlation)
  3. Hedging options:
     a. Short ETH perp (direct hedge)
     b. Short BTC perp (correlated hedge)
     c. Buy "ETH below $3000" on Polymarket (tail hedge)
     d. Reduce position size (passive hedge)
  4. Optimal hedge:
     → Short 1.0 ETH equivalent (50% hedge ratio)
     → Or buy prediction market downside protection
```

The financial reasoning layer transforms high-level intent into a specific trade plan. This requires understanding portfolio theory, correlation dynamics, instrument characteristics, and hedging strategies — knowledge that goes far beyond language understanding.

**Risk awareness layer — understanding what could go wrong:**

```
User says: "梭哈 ETH" / "Go all-in on ETH"

Literal interpretation: Put 100% of portfolio into ETH
Risk-aware interpretation: The user is expressing strong conviction,
  but allocating 100% to a single leveraged position would violate
  any reasonable risk management framework.

Agent should NOT:
  ✗ Execute a 100% allocation with max leverage

Agent should:
  ✓ Acknowledge the conviction ("Strong bullish signal noted")
  ✓ Propose a risk-bounded version ("Recommend 15% allocation
     at 3x leverage — high conviction within risk limits")
  ✓ Ask for confirmation before executing
```

The risk awareness layer acts as a sanity check on the parsed intent. Even when the NLP and financial reasoning are correct, the agent must evaluate whether the resulting trade is prudent — and push back when it isn't.

**User modeling layer — understanding who said it:**

Different users with the same words mean different things:

```
User A (conservative, $10K portfolio): "Buy some ETH"
  → Likely means: Market buy $200-500 worth, spot, no leverage

User B (active trader, $500K portfolio): "Buy some ETH"
  → Likely means: $5K-20K position, perp, moderate leverage

User C (degen, $2K portfolio): "Buy some ETH"
  → Likely means: Max leverage, full send, "we're either going
     to the moon or going to zero"
```

User modeling is the least developed layer in current systems. Most trading agents treat every user identically, applying the same defaults regardless of context. This is a significant gap — and one that D0's progressive disclosure helps with, since the agent can observe the user's existing positions and historical behavior to calibrate its responses.

## Phase 3: The Confirmation Loop Design

The central design problem in intent-centric execution is the confirmation loop: when should the agent ask vs execute?

```
               ┌─────────────────┐
               │   User Intent   │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │  Parse Intent   │
               │  Extract params │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ Confidence      │
               │ Assessment      │──── How certain are we about
               └────────┬────────┘     what the user wants?
                        │
               ┌────────┴────────┐
               │                 │
        HIGH CONFIDENCE    LOW CONFIDENCE
        (all params clear)  (ambiguous params)
               │                 │
               ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │ Risk Check   │  │ Clarify      │
        │              │  │              │
        │ Is this trade│  │ "You said    │
        │ within safe  │  │ '抄底' —     │
        │ limits?      │  │ which asset? │
        │              │  │ how much?"   │
        └──────┬───────┘  └──────┬───────┘
               │                 │
        ┌──────┴───────┐        │
        │              │        │
     SAFE          RISKY        │
        │              │        │
        ▼              ▼        ▼
  ┌──────────┐  ┌───────────────────┐
  │ Execute  │  │ Confirm with User │
  │ directly │  │                   │
  │          │  │ "I'll buy 0.25    │
  │          │  │ ETH at market,    │
  │ (report  │  │ 3x leverage,      │
  │  result) │  │ 5% stop-loss.     │
  │          │  │ Confirm? [Y/N]"   │
  └──────────┘  └───────────────────┘
```

The confirmation loop has two axes: **confidence** (how well did we parse the intent?) and **risk** (how dangerous is the resulting trade?). The matrix looks like this:

| | Low Risk | High Risk |
|---|---|---|
| **High Confidence** | Execute directly | Confirm before executing |
| **Low Confidence** | Clarify, then execute | Clarify, then confirm |

**Examples in practice:**

```
HIGH CONFIDENCE + LOW RISK:
  User: "d0 price ETH"
  Agent: Executes immediately. Shows price. No confirmation needed.

HIGH CONFIDENCE + HIGH RISK:
  User: "Long ETH 10x leverage full portfolio"
  Agent: "I understand you want to go long ETH with 10x leverage
         using your full portfolio ($24,000). This position would
         be liquidated at a 9.1% adverse move. Confirm? [Y/N]"

LOW CONFIDENCE + LOW RISK:
  User: "Check my positions on that prediction market thing"
  Agent: "Do you mean your Polymarket positions? Running:
         d0 positions --exchange polymarket"

LOW CONFIDENCE + HIGH RISK:
  User: "帮我搞点 ETH"
  Agent: "I'd like to buy some ETH for you. A few questions:
         1. How much? (e.g., $500, or 0.1 ETH, or 2% of portfolio)
         2. Market buy now, or wait for a specific price?
         3. Spot or leveraged?
         Your current portfolio: $12,400. No existing ETH exposure."
```

The key design principle: **the cost of an unnecessary confirmation is seconds; the cost of a misunderstood trade is money.** The confirmation loop should err heavily toward confirming. The only case where direct execution is appropriate is high confidence + low risk — and "low risk" must be defined conservatively.

This connects directly to open problem P7 from the AI Trade frontier: "How should agent trading autonomy be bounded?" The confirmation loop is the UX manifestation of autonomy boundaries. Too much confirmation and the agent is useless — it's just a slower version of manual trading. Too little confirmation and the agent becomes dangerous — executing misunderstood trades with real capital.

## Phase 4: Multi-Step Intent Decomposition

The hardest intents aren't single trades — they're strategies that require multiple coordinated actions.

**Example: "Hedge my portfolio"**

```
Step 1: Understand current state
  → d0 positions
  → Current: Long 2.0 ETH ($6,500), Long 0.5 BTC ($32,000)
  → Total portfolio: $48,500
  → Portfolio is 79% correlated to crypto beta

Step 2: Determine hedge strategy
  → Options:
    a. Short ETH perp (direct hedge, carries funding cost)
    b. Short BTC perp (larger position, higher funding cost)
    c. Buy downside protection on prediction market
    d. Reduce position sizes
  → Agent selects: Short 1.0 ETH perp (50% hedge on smaller position)
    + Buy "ETH below $2800 by Q2" at $0.12 (tail protection)

Step 3: Construct orders
  → d0 short ETH 1.0 --leverage 1 --stop-loss 10%
  → d0 buy "ETH below 2800 Q2" 200

Step 4: Confirm with user
  → "To hedge your portfolio, I recommend:
     1. Short 1.0 ETH perp at 1x leverage (50% hedge on ETH position)
     2. Buy 200 shares of 'ETH below $2800 Q2' at $0.12 (tail risk protection)
     Total hedge cost: ~$24 + funding rate on short position
     This reduces your crypto beta exposure from 79% to ~45%.
     Execute both? [Y/N]"
```

Multi-step decomposition requires the agent to:
1. Query current state (read operations — zero config in D0)
2. Apply financial reasoning (correlation analysis, hedge ratio calculation)
3. Map to available instruments (what can be traded on connected exchanges)
4. Construct multiple coordinated orders
5. Present a coherent plan for confirmation

Each step can fail. The agent might miscalculate correlation. It might not have access to the optimal hedging instrument. The prediction market it wants to use might have insufficient liquidity. Robust multi-step decomposition requires fallback logic at every stage.

**Example: "DCA into ETH over the next week" / "帮我定投 ETH 一周"**

```
Step 1: Parse DCA parameters
  → Asset: ETH
  → Duration: 7 days
  → Missing: total amount, frequency, price limits

Step 2: Clarify
  → "I'll set up a DCA plan for ETH over 7 days.
     How much total do you want to invest?
     Suggested: $500 (about 1% of your portfolio)
     Frequency: once per day or twice per day?"

Step 3: User responds: "$1000, once a day"

Step 4: Construct plan
  → 7 market buys of ~$142.85 each
  → Execute first buy immediately
  → Schedule remaining 6 at 24-hour intervals
  → "DCA plan: Buy ~$143 ETH daily for 7 days.
     Total: $1,000. First buy executing now.
     I'll report each execution. Cancel anytime with 'd0 cancel-dca'."
```

DCA is a simple example, but it illustrates the general pattern: intent → clarification → plan → confirmation → execution → monitoring. The entire loop must be handled gracefully, with the agent maintaining context across multiple turns of conversation.

## Phase 5: The Natural Language → Structured Trade Pipeline

Here's the end-to-end pipeline that transforms natural language into an on-chain position:

```
┌─────────────────────────────────────────────────────────┐
│ STAGE 1: RAW INPUT                                      │
│                                                         │
│ "ETH 看起来超卖了，帮我在 3200 以下接一点，别太多"          │
│ "ETH looks oversold, buy some for me below 3200,        │
│  not too much"                                          │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 2: INTENT EXTRACTION                              │
│                                                         │
│ {                                                       │
│   "action": "buy",                                      │
│   "asset": "ETH",                                       │
│   "reasoning": "oversold",                              │
│   "price_constraint": "below 3200",                     │
│   "size_hint": "small (from '别太多/not too much')",     │
│   "urgency": "not urgent (limit order implied)",        │
│   "confidence": 0.82                                    │
│ }                                                       │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 3: PARAMETER RESOLUTION                           │
│                                                         │
│ Check portfolio: $24,000 total, 0 ETH exposure          │
│ "Small" + portfolio context → 1-3% allocation → $240-720│
│ ETH current price: $3,285 → limit at $3,200 = -2.6%    │
│ Default leverage: 1x (conservative due to "别太多")      │
│ Default stop-loss: 5% (standard for limit entry)        │
│                                                         │
│ Resolved order:                                         │
│   Buy 0.15 ETH (~$480) limit at $3,200                  │
│   No leverage, stop-loss at $3,040                      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 4: RISK CHECK                                     │
│                                                         │
│ Position size: 2% of portfolio ✓ (within 5% limit)      │
│ Leverage: 1x ✓ (within 10x limit)                       │
│ Stop-loss: set ✓                                        │
│ Correlation: 0 existing ETH exposure ✓                  │
│ Risk verdict: SAFE — no confirmation needed              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 5: EXECUTION                                      │
│                                                         │
│ d0 buy ETH 0.15 --price 3200 --stop-loss 3040           │
│                                                         │
│ → Order placed: Limit buy 0.15 ETH @ $3,200             │
│ → Stop-loss set at $3,040                                │
│ → Waiting for fill                                       │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ STAGE 6: REPORT                                         │
│                                                         │
│ "已挂单：限价买入 0.15 ETH @ $3,200                       │
│  止损设在 $3,040（-5%）                                   │
│  总金额约 $480（组合的 2%）                                │
│  价格到了会通知你。"                                       │
│                                                         │
│ "Order placed: Limit buy 0.15 ETH @ $3,200               │
│  Stop-loss at $3,040 (-5%)                               │
│  Total ~$480 (2% of portfolio)                           │
│  I'll notify you when it fills."                         │
└─────────────────────────────────────────────────────────┘
```

The bilingual output is deliberate. D0 serves both English-speaking and Chinese-speaking markets, and the agent should respond in the language the user initiated with. The pipeline handles this naturally — the intent extraction is language-agnostic (the structured parameters are the same regardless of input language), and the reporting stage generates output in the user's language.

## Phase 6: Where Intent Parsing Breaks

Honesty about failure modes is essential for building trustworthy systems. Here's where intent parsing fails today:

**Failure mode 1: Implicit reference resolution**

```
User: "Close my losing positions"
Problem: Requires defining "losing" — unrealized P&L < 0?
         P&L below some threshold? Relative to a benchmark?
Risk: Agent closes positions the user wanted to hold
      (maybe they're in drawdown but the thesis hasn't changed)
```

**Failure mode 2: Sarcasm and rhetorical intent**

```
User: "Great, ETH dumped again. Might as well buy more 🙃"
Problem: Is this a genuine buy instruction or sarcastic venting?
Risk: Agent buys ETH when the user was expressing frustration
```

**Failure mode 3: Conflicting signals in the same sentence**

```
User: "I want to buy ETH but the market looks terrible"
Problem: Two contradictory signals — buy intent + bearish assessment
Risk: Agent must decide which signal is primary
```

**Failure mode 4: Cultural and idiomatic complexity**

```
User: "梭哈" (literally: "go all-in at poker")
Problem: In crypto culture, this means "invest everything."
         But does the user literally mean 100% allocation,
         or are they expressing strong conviction?
Risk: Literal interpretation → catastrophic position size
```

Each failure mode points to the same design conclusion: **the agent should treat ambiguity as a signal to confirm, not a problem to solve through inference.** When the confidence score drops below a threshold, the correct action is always to ask — never to guess.

This is the key takeaway from the intent-centric execution paradigm: the goal isn't perfect parsing. Perfect parsing of natural language trading intent may be impossible — there will always be edge cases, ambiguities, and cultural nuances that defy automated interpretation. The goal is a system that knows what it doesn't know, asks when uncertain, executes confidently when clear, and never risks real capital on a guess.

> The best trading agent isn't the one that understands every instruction perfectly. It's the one that knows exactly when it doesn't understand — and asks before it acts. Intent-centric execution is not about eliminating the confirmation loop. It's about making the confirmation loop as narrow and targeted as possible, so the agent adds speed without sacrificing safety.
