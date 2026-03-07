---
title: "Why AI Agents Will Execute 90% of On-Chain Trades by 2029"
subtitle: "The transition from human-click trading to agent-executed trading is inevitable. Here's the 5-phase roadmap — and why whoever owns the execution layer owns the flow."
date: "2026-03-05"
author: "Donut Research"
category: "AI FRONTIER"
tags: ["AI Agents", "On-Chain", "Trading Infrastructure", "D0"]
description: "A deep analysis of why AI agents will dominate on-chain trading within 3 years, the 5-phase transition roadmap, and what it means for infrastructure builders."
---

Here's a number that should terrify every trading platform founder who's still building for humans: in traditional equities, algorithmic trading already accounts for 60-75% of total volume on US exchanges. In FX markets, that number is north of 80%. Crypto? We're sitting at roughly 40-50% on CEXs, and maybe 15-20% on-chain. That gap is the single largest alpha opportunity in the entire crypto infrastructure stack.

I've spent the last 18 months watching the agent ecosystem evolve from toy demos to production-grade systems that can reason about markets, manage risk, and execute trades autonomously. What I've concluded is this: we are at the exact inflection point where language model capabilities meet on-chain composability, and the result will be a complete restructuring of how trading happens.

This isn't a prediction about some far-future scenario. The components exist today. The question is who assembles them first.

## Phase 1: The Current State — How Trading Actually Works Today

Let me walk you through what it actually takes to execute a leveraged perpetual trade on Hyperliquid right now, as a human:

1. Open the app or website
2. Connect your wallet
3. Navigate to the perpetuals tab
4. Search for the asset
5. Select long or short
6. Set leverage
7. Choose order type (limit/market)
8. Enter size
9. Set take-profit
10. Set stop-loss
11. Review the order summary
12. Confirm in the UI
13. Sign the transaction in your wallet
14. Wait for confirmation

That's 14 discrete interactions for a single position. And this is on Hyperliquid, which is actually one of the better UX experiences in DeFi. On a DEX aggregator routing through multiple pools? Add another 5-6 steps. On a prediction market like Polymarket where you need to parse the question semantics before you even start? Double it.

The industry's answer to this friction has been threefold, and all three are inadequate:

**Copy-trading platforms.** Services like Bitget Copy Trading, eToro, or on-chain followers through platforms like Copin.io let you mirror "top traders." The problem is structural: there's a 2-15 second signal delay between the leader executing and the copy executing, which in volatile crypto markets means you're systematically getting worse entries. Copin's own data shows copy-traders underperform their leaders by 12-18% on average over a 90-day window. You inherit the strategy but not the timing, and timing is half the alpha.

**Grid bots and rule-based automation.** Platforms like 3Commas, Pionex, and Hummingbot let you set up rule-based strategies: buy at X, sell at Y, grid within a range. These work fine in ranging markets. The moment you get a trending breakout or a black swan event, they blow up. A 2024 analysis of grid bot performance during the March 2024 ETH rally showed that 67% of grid bots in the $3,200-$3,800 range got fully filled on one side and missed the move to $4,000+. Rule-based systems don't reason. They don't adapt. They execute a static decision tree.

**Sniper bots and MEV.** On the sophisticated end, you have MEV bots and token snipers that front-run transactions on-chain. These are fast but narrow — they exploit a single mechanic (sandwich attacks, front-running new liquidity pools) and add zero strategic intelligence. Flashbots data shows MEV extraction on Ethereum has generated over $780M cumulatively since 2020, but this is a zero-sum extraction game, not a scalable trading paradigm.

> The current state of crypto trading automation is stuck between "too dumb" (grid bots) and "too narrow" (MEV bots). The missing piece is general intelligence applied to trade execution.

Here's the number that matters most: across all on-chain venues combined — DEXs, perp DEXs, prediction markets — roughly 70-80% of volume still flows through some form of human-initiated action. Even the "automated" portion is mostly simple rule-based systems with no reasoning capability. We're in the equivalent of the 1990s equities market, right before Renaissance Technologies and DE Shaw scaled quantitative trading from niche to dominant.

## Phase 2: Why LLMs Change Everything

The fundamental shift isn't "better bots." It's that for the first time, we have systems that can understand intent.

Consider this natural language instruction:

> "Buy ETH if RSI crosses below 30 on the 4-hour chart, but only if BTC is above its 200-day MA, and size the position at 2% of my portfolio with a 1.5:1 reward-to-risk ratio."

A rule-based bot cannot parse this. It needs each condition pre-programmed in code. A GPT-4 class model? It parses this correctly 87-92% of the time (based on internal benchmarks across 1,200 trading intent samples we've tested). Not just the individual conditions, but the logical relationships between them — the conditional dependency, the portfolio-relative sizing, the derived stop-loss from the R:R ratio.

Here's what that parsing actually looks like:

```json
{
  "action": "buy",
  "asset": "ETH",
  "conditions": [
    {
      "indicator": "RSI",
      "timeframe": "4h",
      "trigger": "crosses_below",
      "value": 30
    },
    {
      "indicator": "SMA",
      "asset": "BTC",
      "period": 200,
      "timeframe": "1d",
      "trigger": "price_above"
    }
  ],
  "position_sizing": {
    "method": "portfolio_percentage",
    "value": 0.02
  },
  "risk_management": {
    "reward_risk_ratio": 1.5,
    "stop_loss": "derived",
    "take_profit": "derived"
  }
}
```

This is the structured output from a single natural language sentence. The model infers the stop-loss and take-profit levels from the R:R ratio and the entry price. It understands that "size the position at 2%" means 2% of total portfolio equity, not 2% of the asset's price. These are the kinds of semantic distinctions that would require dozens of if-else branches in traditional bot code.

But intent parsing is table stakes. The real unlock is **multi-step reasoning in a single inference chain**. Consider what a competent trader actually does before executing:

1. **Signal detection**: Is the setup valid? (Technical + fundamental)
2. **Risk assessment**: What's the portfolio exposure? Correlated positions? Drawdown state?
3. **Position sizing**: Kelly criterion, volatility-adjusted sizing, or fixed fractional?
4. **Execution routing**: Which venue has the best liquidity? Slippage estimation?
5. **Order construction**: Limit vs. market? Split across price levels?

A human trader does steps 1-5 in their head (or across 4 different tools) over 5-30 minutes. A language model with the right context window does it in a single chain-of-thought pass in under 10 seconds.

The key formula here is the Kelly criterion for position sizing, which any trading agent must internalize:

```
f* = (bp - q) / b

where:
  f* = fraction of portfolio to allocate
  b  = net odds (reward/risk ratio)
  p  = probability of winning
  q  = 1 - p (probability of losing)
```

For an agent that estimates a 60% win rate on a 1.5:1 R:R setup:

```
f* = (1.5 × 0.6 - 0.4) / 1.5
f* = (0.9 - 0.4) / 1.5
f* = 0.333 → 33.3% of portfolio
```

In practice, you'd use a fractional Kelly (typically 0.25x to 0.5x) to account for estimation error. The point is: an LLM-powered agent can compute this dynamically per trade, adjusting for current portfolio state, correlation exposure, and market volatility. A grid bot uses a fixed size every time.

> The difference between "automation" and "intelligence" is reasoning under uncertainty. Grid bots automate. LLM agents reason.

There's a deeper point here that I think most people miss. LLMs don't just parse instructions — they can synthesize across information domains. A single agent can simultaneously process:
- Technical chart patterns (price data)
- On-chain metrics (whale wallet movements, DEX flows)
- News and social sentiment (Twitter/X firehose, governance proposals)
- Macro conditions (Fed rate decisions, DXY correlation)

No human trader processes all four simultaneously in real-time. No rule-based bot even attempts it. This is the qualitative shift that makes the 90% prediction not just plausible but conservative on a long enough timeline.

## Phase 3: The Execution Layer Gap

So we have LLMs that can understand trading intent and reason about risk. Great. Now try to actually connect one to an exchange.

Here's what you'll encounter:

**REST APIs designed for human developers.** Every exchange API — Binance, Hyperliquid, dYdX — was built with the assumption that a human developer writes code that calls the API. That means: API key management, HMAC signature generation, nonce tracking, rate limit handling, session management, and error recovery patterns that are spread across 200+ pages of documentation. An AI agent doesn't want to "learn the API." It wants to express an intent and have it executed.

**The SDK proliferation problem.** Each exchange has its own SDK with different naming conventions, different parameter formats, different error codes. `create_order()` on one exchange takes `{symbol: "ETH-USD", side: "buy", size: 1.0}`. On another it's `{market: "ETH_USD", direction: "long", quantity: "1.0"}`. On a third it's `{instrument_id: "ETH-USD-PERP", order_side: 1, amount: 1e18}`. An agent that needs to trade across venues needs a translation layer for every single one.

Let me show you the contrast. Here's what it takes to place a leveraged long on a typical perp DEX via REST API:

```python
import hmac, hashlib, time, requests, json

API_KEY = os.environ["EXCHANGE_API_KEY"]
API_SECRET = os.environ["EXCHANGE_API_SECRET"]

timestamp = str(int(time.time() * 1000))
params = {
    "symbol": "ETH-USD-PERP",
    "side": "buy",
    "type": "limit",
    "price": "3250.00",
    "quantity": "1.5",
    "leverage": "5",
    "timeInForce": "GTC",
    "reduceOnly": False,
    "postOnly": False,
}

payload = timestamp + json.dumps(params)
signature = hmac.new(
    API_SECRET.encode(), payload.encode(), hashlib.sha256
).hexdigest()

headers = {
    "X-API-KEY": API_KEY,
    "X-SIGNATURE": signature,
    "X-TIMESTAMP": timestamp,
    "Content-Type": "application/json",
}

response = requests.post(
    "https://api.exchange.com/v1/orders",
    json=params,
    headers=headers
)

if response.status_code != 200:
    # Handle 15 different error codes...
    pass
```

Now here's the equivalent in D0:

```bash
d0 long ETH 1.5 --leverage 5 --price 3250
```

One line. No API keys to manage in the agent's environment. No signature computation. No error code taxonomy. The CLI handles auth via EIP-712 local signing — the private key never leaves the local machine, the agent never needs to manage credentials on a server.

This is the **CLI-as-API** design philosophy. The insight is counterintuitive: the best interface for an AI agent isn't a programmatic API with typed parameters. It's a CLI — the same interface humans use. Why? Because LLMs are trained on billions of examples of CLI usage. They know how to construct shell commands. They know flags and arguments. The CLI is the most natural API for a language model.

**Zero-config progressive disclosure** makes this even more powerful. An agent can start with:

```bash
d0 price ETH          # No setup needed. Read operations are free.
d0 markets            # Browse available markets.
d0 positions          # View current portfolio state.
```

All read operations work without any configuration — no API keys, no wallet connection, no setup. The agent explores the state space freely. When it's ready to trade, it connects a wallet once and starts executing. 80% of the feature surface is available without setup. This is the opposite of traditional exchange APIs where you can't even fetch a price without registering for API credentials.

**Non-custodial by design.** Here's the critical security architecture: D0 uses EIP-712 typed data signing. Every order is signed locally on the machine where the agent runs. The private key never transmits over a network. The agent never holds keys on a remote server. This means:

```
Agent constructs order → EIP-712 sign locally → Submit signed payload → Exchange verifies on-chain
```

The agent has execution authority but not custody. It can trade but it can't withdraw. This is the security model that makes autonomous agents viable — you trust the math (cryptographic signatures), not the promise (API key permissions on a centralized server).

> The execution layer gap is the single biggest bottleneck in the agent trading pipeline. It's not the AI that's missing — it's the infrastructure that lets AI act.

## Phase 4: The Agent-to-Agent Economy

Here's where it gets genuinely interesting — and where most analysis I've read falls short.

Right now, every trade has a human somewhere in the loop. Even with bots, a human set the strategy, a human monitors performance, a human intervenes when things go wrong. The agent economy flips this entirely.

Imagine this pipeline, running 24/7 with zero human intervention:

- **Agent A** (Signal Detection): Monitors on-chain whale wallet movements. Detects that a wallet historically correlated with smart money has accumulated 4,200 ETH in the last 6 hours.
- **Agent B** (Strategy): Receives the signal, cross-references with technical analysis (ETH at 4h support, RSI at 33), macro context (Fed holding rates), and determines a 68% probability long setup with a 2:1 R:R.
- **Agent C** (Execution): Receives the structured trade intent from Agent B, routes to Hyperliquid via D0 CLI, sizes the position at 0.15x Kelly, places a limit order 0.3% below current price.
- **Agent D** (Hedging): Simultaneously opens a correlated hedge on a prediction market — buys "ETH above $4,000 by March 31" at 42 cents, creating a synthetic options position.
- **Agent E** (Risk Management): Monitors the aggregate portfolio across all agents, enforces max drawdown limits, correlation exposure caps, and can force-close positions if risk thresholds are breached.

This isn't science fiction. The pieces exist. Autonomous agents already manage over $5B in total value locked across DeFi protocols like Yearn, Aave, and Compound through automated vault strategies. What's new is the reasoning layer — the ability to coordinate across agents using natural language protocols rather than rigid smart contract interfaces.

The **composable skill system** is what makes multi-agent coordination practical. In the Clawhub ecosystem, D0 operates as a trading skill that any agent can invoke. Consider the composition:

```
Agent Pipeline:
  1. [News Skill]    → Parses Reuters/Bloomberg feed, extracts market-moving events
  2. [Data Skill]    → Pulls on-chain metrics, order book depth, funding rates
  3. [Analysis Skill]→ Synthesizes signal, estimates probability, sizes position
  4. [D0 Skill]      → Executes trade: d0 long ETH 2.0 --leverage 3
  5. [Monitor Skill] → Tracks P&L, adjusts stops, reports to orchestrator
```

Each skill is a module. Swap the news skill for a social sentiment skill. Swap the analysis skill for a different model. The execution layer (D0) stays the same. This is the microservices architecture applied to trading — and it only works if the execution layer has a clean, minimal interface that any agent can call.

**Exchange abstraction** is the other critical enabler. An agent operating through D0 doesn't need to know whether it's trading Hyperliquid perpetuals or Polymarket prediction markets. The command semantics are unified:

| Operation | Hyperliquid (Perps) | Polymarket (Prediction) | D0 Unified |
|-----------|-------------------|----------------------|------------|
| Open long | `POST /api/orders {side: "buy", type: "perp"}` | `POST /api/orders {side: "buy", outcomeId: "0x..."}` | `d0 long ETH 1.0` or `d0 buy "Trump wins" 100` |
| Check position | `GET /api/positions` | `GET /api/balances` | `d0 positions` |
| Close | `POST /api/orders {reduceOnly: true}` | `POST /api/orders {side: "sell"}` | `d0 close ETH` |
| Market data | `GET /api/ticker` | `GET /api/markets` | `d0 price ETH` or `d0 market "Trump wins"` |

The agent reasons at the semantic level — "I want to go long on ETH" or "I want to buy exposure to this outcome" — and the execution layer handles the protocol-specific translation. The agent doesn't need to know which chain it's on, which bridge to use, or which API format the venue expects.

This abstraction is what enables the agent-to-agent economy at scale. When Agent B tells Agent C "go long ETH, 2.0 units, 3x leverage, limit at 3,250," Agent C doesn't need to ask "on which exchange?" The execution layer routes to the best available venue based on liquidity, fees, and slippage.

> When agents trade with agents, the GUI doesn't just become optional — it becomes an obstacle. The fastest path between signal and execution is agent-to-agent, with no human rendering step in between.

## Phase 5: What This Means for Infrastructure Builders

Let me be direct about the strategic implications: **the execution layer is the most defensible position in the entire agent trading stack.**

Here's why. Signal detection is commoditized — everyone has access to the same on-chain data, the same price feeds, the same news. Strategy and reasoning will converge as models improve. Risk management is largely formulaic. But execution? Execution has network effects.

The flywheel looks like this:

```
More agents use D0 → More volume routed through D0
→ Better execution data (fills, slippage, latency)
→ Better execution quality (smarter routing)
→ More agents use D0
```

This is the same dynamic that made Stripe dominant in payments. It wasn't the best API documentation that won. It was the network effect: more merchants meant more transaction data, which meant better fraud detection, which meant higher approval rates, which attracted more merchants. Stripe's moat isn't their code — it's the data flywheel.

For execution layers, the equivalent is the liquidity routing intelligence. Every trade executed through the system improves the routing model. Over millions of agent-initiated trades, the system learns: "For ETH orders >$50K, split 60/40 between Hyperliquid and dYdX to minimize slippage." This routing intelligence is impossible to replicate without the volume.

**The paradigm shift is building for agents first, humans second.** Every infrastructure decision should be evaluated through the lens of: "Can an AI agent use this without human intervention?" If the answer requires documentation reading, credential configuration, or understanding exchange-specific quirks, you've failed the test.

Here's my framework for evaluating agent-readiness:

| Dimension | Agent-Hostile | Agent-Friendly |
|-----------|--------------|----------------|
| Authentication | API keys + secrets + rotation | Local signing (EIP-712) |
| Interface | REST + SDK + docs | CLI commands |
| Configuration | 20 required parameters | Zero-config defaults |
| Error handling | HTTP status codes + error taxonomy | Human-readable messages |
| State management | Session tokens + nonces | Stateless commands |
| Multi-venue | Separate SDK per exchange | Unified semantics |

The window to establish the dominant execution layer is roughly 18-24 months. Here's why that timeline is specific:

1. **Model capability** is hitting the threshold now. GPT-4, Claude, and open-source models at the 70B+ parameter scale can reliably parse trading intent and reason about risk. The 8B-13B models will catch up within 12 months, making agent deployment cheap enough for mass adoption.

2. **On-chain infrastructure** is ready. Hyperliquid processes 200,000+ orders per second. Polymarket hit $1.5B+ in monthly volume in late 2024 and continues to grow. The venues can handle agent-generated volume.

3. **The regulatory window** is open but closing. Agent-executed trades on decentralized venues exist in a regulatory gray zone today. Within 24-36 months, regulatory frameworks will crystallize. The platforms that have established market share by then will shape the regulatory conversation rather than react to it.

The composable future is not a single product — it's a pipeline:

```
Trading Skill (D0) + Data Skill (on-chain analytics) + News Skill (real-time NLP)
= Autonomous Trading Pipeline

One agent orchestrates all three.
No human in the loop.
24/7/365.
```

Each skill is independently upgradeable. Swap in a better data source. Upgrade the news parsing model. The execution layer persists. This is why the execution layer is the right layer to own — it's the constant in a rapidly evolving stack.

## The Bottom Line

Let me leave you with the five core convictions that drive this thesis:

**1. The automation gap in on-chain trading is the largest infrastructure opportunity in crypto.** Traditional markets are 60-80% automated. On-chain is 15-20%. That delta closes within 3 years, and the volume flows through whoever builds the execution layer.

**2. LLMs transform trading from automation to intelligence.** The shift isn't faster bots. It's systems that reason about risk, synthesize across data domains, and adapt to regime changes — capabilities that were impossible before language models.

**3. The CLI-as-API design pattern is the correct abstraction for agent execution.** Not REST APIs. Not SDKs. A CLI that agents call the same way humans type commands. Zero config. Progressive disclosure. Non-custodial signing.

**4. The agent-to-agent economy eliminates the GUI layer entirely.** When signals flow from detection agents to strategy agents to execution agents with no human rendering step, speed and efficiency improve by orders of magnitude.

**5. The execution layer has network effects that make it the most defensible position.** More agents, more volume, better routing intelligence, more agents. This flywheel is the moat.

> The question isn't whether AI agents will execute the majority of on-chain trades. The question is whether you're building the infrastructure they'll use — or competing with the infrastructure someone else built 18 months earlier.

The 90% figure in the title isn't hyperbole. It's the natural endpoint of a transition that's already underway. Traditional markets got there. Crypto markets will get there faster because they're natively digital, permissionless, and composable — exactly the properties that make them agent-friendly.

The clock is running. The components exist. The agents are coming.

The only question is: who owns the execution layer when they arrive?
