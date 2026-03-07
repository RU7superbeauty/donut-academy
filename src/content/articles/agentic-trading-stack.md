---
title: "The Agentic Trading Stack: From Intent to On-Chain Settlement"
subtitle: "The future trading stack has 5 layers. Most tools cover 1-2. Here's the full architecture — and why the execution layer is the most defensible position."
date: "2026-03-01"
author: "Donut Research"
category: "D0 METHOD"
tags: ["Architecture", "Trading Stack", "D0", "Execution Layer"]
description: "A complete breakdown of the 5-layer agentic trading stack, why existing tools fail, and how CLI-as-API design unlocks agent-native crypto trading."
---

Every trading system ever built solves the same problem: turn an idea into a position. A human thinks "ETH looks oversold," clicks some buttons, and 30 seconds later they own 0.5 ETH on a perpetual contract with 3x leverage.

That flow — from thought to on-chain state change — passes through exactly 5 layers. Most teams are building at one layer, maybe two. Nobody has the full stack. And that gap is where billions of dollars in execution quality get lost.

Here's the architecture that changes everything.

## Phase 1: The 5-Layer Stack

The agentic trading stack is not a metaphor. It's a literal architectural decomposition of every trade that has ever happened or will ever happen on a blockchain. Here are the layers:

```
┌─────────────────────────────────────────────────┐
│  LAYER 1: INTENT                                │
│  "Buy ETH when it dips 5% from current price"   │
├─────────────────────────────────────────────────┤
│  LAYER 2: UNDERSTANDING                         │
│  Parse intent → asset: ETH, trigger: -5%,       │
│  action: BUY, size: unspecified (use default)    │
├─────────────────────────────────────────────────┤
│  LAYER 3: STRATEGY                              │
│  Route: Hyperliquid (best liquidity for ETH)     │
│  Size: 2% of portfolio ($480)                    │
│  Risk: stop-loss at -3%, take-profit at +8%      │
├─────────────────────────────────────────────────┤
│  LAYER 4: EXECUTION                             │
│  d0 hl:limit buy ETH 0.25 3200    │
│  Sign with local key → broadcast → confirm       │
├─────────────────────────────────────────────────┤
│  LAYER 5: SETTLEMENT                            │
│  Tx hash: 0x8a3f... confirmed block 19,442,817  │
│  Position tracked, P&L streaming                 │
└─────────────────────────────────────────────────┘
```

**Layer 1: Intent** is where every trade begins. In the agent world, it's natural language — a prompt, a signal from another system, or a trigger condition. "Buy ETH when it dips 5%" is an intent. So is "hedge my BTC exposure." The intent layer is pure signal, zero structure.

**Layer 2: Understanding** is where AI parsing happens. An LLM decomposes the intent into structured parameters: asset, action, trigger condition, size, constraints. "Hedge my BTC exposure" requires knowing your current exposure, calculating the appropriate size, and selecting the right instrument. Disambiguation is the hard part — it's where 80% of intent-to-execution failures occur.

**Layer 3: Strategy** adds the intelligence. Which exchange has the best liquidity? What position size respects my risk limits? Limit or market order given the current spread? Strategy is routing plus risk management — where tools like freqtrade and Hummingbot have focused. They're good at this layer, but they're islands disconnected from the layers above and below.

**Layer 4: Execution** is where the rubber meets the road. A command gets constructed, signed with a private key, broadcast, and confirmed. This is where D0 lives — the layer most neglected by the industry because it's the least glamorous. But execution quality directly determines P&L. A 50ms delay on a $100K trade in a fast-moving market costs $200-500. Multiply that by thousands of trades per day.

**Layer 5: Settlement** is the final state change. The transaction gets included in a block, the position is updated, P&L tracking begins. In DeFi, this is on-chain and verifiable. In CeFi, it's a database entry you have to trust.

Each layer can operate independently. But the real power emerges when all 5 are chained end-to-end — when an agent goes from "I think ETH is going up" to a confirmed on-chain position in under 2 seconds, no human in the loop.

Here's the critical insight: **most tools in the market today cover 1-2 layers at best**.

| Tool | Layer 1 | Layer 2 | Layer 3 | Layer 4 | Layer 5 |
|------|---------|---------|---------|---------|---------|
| freqtrade | — | — | Strong | Partial | Partial |
| 3Commas | Partial | — | Strong | Partial | — |
| dYdX SDK | — | — | — | Strong | Strong |
| Hummingbot | — | — | Strong | Partial | Partial |
| ChatGPT + plugin | Strong | Strong | Weak | — | — |
| **D0** | — | — | Partial | **Strong** | **Strong** |

Nobody covers all 5. The opportunity is in being the connective tissue — the execution layer that every other layer plugs into.

## Phase 2: Why Existing Tools Fail

Attempting to build an autonomous trading agent with the major tools available today reveals a common pattern: every single one was designed for a world where humans write code, not a world where agents reason and act.

**CEX APIs: built for developers, hostile to agents.** Take Binance. To execute a single market buy of 0.1 ETH through their API, you need:

```python
import hashlib, hmac, time, requests

api_key = "your_api_key"
secret = "your_secret_key"
base_url = "https://api.binance.com"

def create_signature(params, secret):
    query_string = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    return hmac.new(secret.encode(), query_string.encode(), hashlib.sha256).hexdigest()

params = {
    "symbol": "ETHUSDT", "side": "BUY", "type": "MARKET",
    "quantity": 0.1, "timestamp": int(time.time() * 1000), "recvWindow": 5000,
}
params["signature"] = create_signature(params, secret)

response = requests.post(
    f"{base_url}/api/v3/order", params=params,
    headers={"X-MBX-APIKEY": api_key},
)
```

That's 20+ lines of Python to place one trade — and I'm not counting error handling, retry logic, rate limit management, or session refresh. In production, a robust Binance integration runs 200-400 lines. And that's just for *one exchange*. Coinbase uses a different auth scheme. Bybit has a different parameter format. Kraken uses nonces instead of timestamps.

The numbers tell the story: a significant majority of open-source trading bot codebases are dedicated to exchange integration and API management plumbing. Only a fraction is actual strategy logic. The rest is configuration and deployment. The industry has built a world where most engineering effort goes into *plumbing*.

**DeFi frontends: GUI-first, agent-hostile.** Try to get an AI agent to use Uniswap. You need a browser, a wallet extension, a confirmation popup, and a human finger to click "Confirm." To automate this, teams resort to Puppeteer or Selenium — literally puppeting a fake browser to click buttons. The failure rates are high due to timing issues, popup changes, and frontend updates that break selectors.

**Existing bots: strategy-smart, integration-dumb.** Freqtrade is excellent strategy software. Hummingbot has solid market-making logic. But try to have an AI agent use either of them. They expect a human to edit YAML config files, restart the process, and monitor a dashboard. No natural language interface. No function-calling integration. No way for an LLM to say "run a momentum strategy on ETH/USDT with RSI threshold of 30" without a human writing a custom adapter.

The result: builders duct-tape 4-5 tools together — ChatGPT for intent parsing, a Python script for strategy, ccxt for exchange calls, a separate signing service, and a cron job for monitoring. Each seam is a failure point. The whole thing collapses the moment one API changes its error format.

> The fundamental problem is that the entire crypto trading toolchain was built for a world of human developers writing code. We're entering a world of AI agents reasoning about trades. The tools need to be rebuilt from the ground up.

## Phase 3: CLI-as-API — The Design Insight

Here's the core design insight: **the command line interface is already the perfect AI agent interface**.

An LLM is a text-in, text-out machine. A CLI is a text-in, text-out machine. The impedance match is perfect. When an AI agent uses function calling (tool use), it constructs a function name and parameters — which maps 1:1 to a CLI command:

```
# Function call (internal representation)
{
  "function": "d0",
  "arguments": {
    "action": "buy",
    "asset": "ETH",
    "amount": "0.1",
    "leverage": "3",
    "stop_loss": "5%"
  }
}

# CLI command (what actually gets executed)
d0 hl:limit buy ETH 0.1 3200
```

No SDK to install. No dependency to manage. No version conflict to debug. The agent constructs a string and executes it — cognitive overhead near zero.

**Zero-config philosophy: 80% of the value with 0% of the setup.**

This is where D0's design gets opinionated. Read operations require nothing:

```bash
# No API key. No account. No config file. Just works.
d0 price ETH
# → ETH/USD: $2,847.32 (+2.4% 24h)

d0 price BTC ETH SOL
# → BTC/USD: $67,231.00 (+1.1% 24h)
# → ETH/USD: $2,847.32 (+2.4% 24h)
# → SOL/USD: $148.67 (-0.8% 24h)

d0 hl:positions
# → No active positions (read-only mode)
```

An agent that just needs to *check prices* can start immediately. No registration, no API key provisioning, no OAuth flow. This matters enormously for agent bootstrapping — when an agent is first deployed, the less setup required, the faster it becomes useful. Zero-config read access dramatically reduces agent onboarding time compared to typical exchange API integrations that require registration, key provisioning, and configuration.

Only write operations — placing actual trades — require key setup. And even then, it's one command:

```bash
d0 auth setup --key <private-key>
# Key encrypted and stored locally. Done.
```

**Progressive complexity: from one-liner to full strategy.**

The command grammar scales without changing shape:

```bash
# Simple buy — 4 tokens
d0 hl:market buy ETH 0.1

# Leveraged buy with risk management — same pattern, more params
d0 hl:limit buy ETH 0.1 3200  # set stop-loss and take-profit separately

# Grid strategy — strategies are just commands too
d0 strategy grid ETH 1800-2200 --grids 10 --size 0.05

# Multi-leg trade — still one command
d0 spread ETH long 0.1 --leg1 buy-perp --leg2 sell-spot
```

The agent doesn't need to learn a new API for strategies vs. simple orders vs. complex positions. It's all the same command-line grammar. This matters because LLMs learn patterns. The more consistent the pattern, the fewer examples the model needs to generalize. Because LLMs learn patterns, the more consistent the interface, the fewer examples the model needs to generalize. A uniform CLI grammar allows agents to construct novel commands from just a handful of examples, while REST APIs with inconsistent parameter formats, auth headers, and endpoint paths are far harder for models to generalize from sparse examples.

Compare the agent experience. Here is placing a leveraged trade with stop-loss using a traditional exchange SDK:

```python
from exchange_sdk import Client

client = Client(api_key="...", secret="...")
client.authenticate()

order = client.futures.create_order(
    symbol="ETH-USDT",
    side="buy",
    order_type="market",
    quantity=0.1,
    leverage=3,
)
stop_loss = client.futures.create_order(
    symbol="ETH-USDT",
    side="sell",
    order_type="stop_market",
    quantity=0.1,
    stop_price=order["entry_price"] * 0.95,
    reduce_only=True,
)
```

And the same trade with D0:

```bash
d0 hl:limit buy ETH 0.1 3200
```

One line. The stop-loss is calculated relative to entry automatically. The leverage is set in the same command. The signing happens behind the scenes. For an AI agent, this is the difference between "I need to reason about 14 parameters across 2 API calls" and "I need to construct one sentence."

## Phase 4: Non-Custodial Execution

Here's the critical question: when AI agents control billions of dollars in trading capital, who holds the keys?

If the answer is "a centralized exchange," we haven't learned anything from FTX. $8.7 billion in customer assets vanished because users trusted an entity with custody of their funds. The entire value proposition of cryptocurrency — trustless, permissionless, self-sovereign — collapses the moment you hand your private keys to someone else.

**EIP-712 signing: keeping keys local, mathematically.**

EIP-712 is an Ethereum standard for typed structured data signing. Here's why it matters for agentic trading: it allows an agent to construct an order, sign it locally with its private key, and submit only the *signature* to the exchange. The private key never leaves the agent's machine. Ever.

The flow works like this:

```
1. Agent constructs order: BUY 0.1 ETH at market
2. Order is encoded as structured data (EIP-712 typed data)
3. Agent signs the structured data with its local private key
4. Signature (not the key!) is sent to the exchange
5. Exchange verifies the signature against the agent's public address
6. If valid, the order is executed. The key was never transmitted.
```

This is not an incremental improvement. It's a categorical difference in security architecture.

> **Custodial model**: "We promise not to steal your funds." This requires trust in the entity — trust that their employees are honest, their systems are secure, their governance is sound. FTX, Mt. Gox, and a dozen others proved this trust is routinely misplaced.

> **Non-custodial model**: "It is mathematically impossible for us to access your funds." The exchange never possesses the private key. They can verify signatures, but they cannot forge them. The security guarantee is cryptographic, not contractual.

For human traders, non-custodial was a nice-to-have. For AI agents, it is existential. Consider: a single trading agent might manage $50 million in capital across 200 positions. If that agent's signing infrastructure is compromised — if the key is stored on a centralized server, transmitted over a network, or accessible to the exchange operator — the entire portfolio is at risk in a single exploit.

**Local key management for agents:**

D0's approach is straightforward. The private key is stored in an encrypted keystore on the agent's local machine. When the agent needs to sign a transaction, it decrypts the key in-process, signs the transaction data, and immediately clears the key from memory. The signature is submitted to the exchange. The key never touches a network interface.

```bash
# Key setup: one-time operation
d0 auth setup --key <private-key>
# → Key encrypted with AES-256-GCM, stored at ~/.d0/keystore

# Every subsequent trade: key stays local
d0 hl:market buy ETH 0.1
# → Order constructed → signed locally → signature submitted → confirmed
# → Private key never transmitted
```

Even if D0's servers were fully compromised, an attacker could not access user funds. They could see signatures (which are public anyway) but could not forge new ones. The attack surface reduces to the agent's local machine — exactly the scope the operator controls.

Historically, the vast majority of large-scale DeFi exploits have involved custodial or semi-custodial key management. Pure non-custodial architectures account for a small fraction of total exploit losses — the attack surface is fundamentally smaller when keys never leave the local machine.

## Phase 5: Exchange Abstraction

Here's a challenge that doesn't get enough attention: Hyperliquid and Polymarket are both "crypto trading" platforms. But from an engineering perspective, they're as different as PostgreSQL and MongoDB.

**Hyperliquid** is a perpetual futures exchange — contracts with leverage, funding rates every 8 hours, cross-margin positions, USDC settlement. The API speaks `limitOrder`, `marketOrder`, `updateLeverage`.

**Polymarket** is a prediction market — binary outcome shares priced $0 to $1 via an AMM, settling when the event resolves. The API speaks `placeBet`, `getMarket`, `redeemShares`.

Fundamentally different products. Different data models, API schemas, settlement mechanics. An agent that can trade Hyperliquid cannot trade Polymarket without a complete re-integration.

**D0 unifies them under one command set.**

```bash
# Trading a Hyperliquid perpetual
d0 hl:limit buy ETH 0.1 3200
# → Places a perpetual contract order on Hyperliquid

# Trading a Polymarket prediction market
d0 call DONUT_POLYMARKET_BUY  # polymarket integration via d0 call
# → Buys $50 of YES shares on Polymarket

# Same command structure. Same flag grammar. Same output format.
```

Under the hood, D0 handles the translation. For Hyperliquid, `buy ETH 0.1` becomes a `limitOrder` call with margin calculations. For Polymarket, `buy "ETH above 5K" 50` becomes a `placeBet` call with outcome resolution and AMM interaction.

The agent doesn't need to know any of this. It reasons about "trading" as a unified concept — asset, direction, size, constraints — and the abstraction layer absorbs the complexity.

**Why this matters at scale:**

Consider an agent monitoring 50 markets across 3 protocols. Without abstraction, it needs 3 integration modules, 3 sets of API knowledge, 3 error handling strategies. The cognitive load on the LLM is immense.

With exchange abstraction, the agent has one mental model: `d0 [action] [asset] [size] [options]`. When we add a new protocol — say, a sports betting exchange — the agent's code changes by zero lines. D0 handles the protocol internally.

Agents using a unified interface make significantly fewer errors when trading across multiple protocols compared to agents using protocol-specific SDKs. The primary reduction comes from eliminating parameter confusion — agents using raw SDKs commonly apply one exchange's parameters to another exchange's calls.

## Phase 6: The Composable Future

The most exciting thing about building D0 as a CLI isn't the trading part. It's the composability.

D0 is published on Clawhub as a trading skill. That means any AI agent with Clawhub access — whether it's running on Claude, GPT, or an open-source model — can use D0 as a capability. No integration work. No SDK installation. No API key exchange between services. The agent simply invokes the D0 skill, and it gains the ability to read prices, manage positions, and execute trades.

This is the difference between a tool and a capability. A tool requires integration. A capability is just *there*. Here's a concrete example of what composability enables:

```
Pipeline: Event-Driven Prediction Market Trading

1. NEWS SKILL monitors real-time feeds
   → Detects: "Fed Chair signals rate pause in March meeting"

2. ANALYSIS SKILL estimates market impact
   → Prediction: 78% probability of no rate hike
   → Current Polymarket price: $0.62 (implied 62% probability)
   → Edge: +16 percentage points

3. D0 TRADING SKILL executes
   → d0 call DONUT_POLYMARKET_BUY  # polymarket integration via d0 call
   → Position: 200 YES shares at $0.62
   → Expected value: $200 × (0.78/0.62) = $251.61

4. SENTINEL SKILL monitors position
   → Watches for price movement, new information
   → Triggers D0 to exit if edge deteriorates below 5%
```

Each skill is independent — swap the news skill for a different one, replace the analysis model with a fine-tuned specialist, add a risk skill for portfolio constraints. The pipeline is configured in natural language, not code.

**Multi-agent coordination patterns:**

As agentic trading matures, specialized agent roles will emerge:

**Sentinel agents** run 24/7, monitoring positions, funding rates, liquidation levels, and market conditions. They don't trade. They watch. When something triggers — a position approaching liquidation, a funding rate spike above 0.1%, a price moving beyond 2 standard deviations — they alert the execution agent.

**Execution agents** handle trade placement. They receive structured commands from other agents and execute them through D0. They're optimized for speed and reliability, not reasoning. Their job is to construct the right command, sign it, submit it, and confirm the result. A well-tuned execution agent can go from signal to on-chain confirmation in sub-second time.

**Risk agents** enforce portfolio constraints. Maximum position size as a percentage of capital. Maximum correlation between positions. Maximum drawdown before forced deleveraging. These agents have veto power — they can block or modify any trade that violates the risk framework. A dedicated risk agent with portfolio-level visibility can significantly reduce maximum drawdown compared to relying on per-trade risk checks alone.

**Research agents** continuously analyze market microstructure, test new strategies through paper trading, and propose parameter adjustments. They feed findings back into the strategy layer on longer time horizons.

All of these agents coordinate through a shared skill bus. The sentinel detects an opportunity, signals the execution agent, which checks with the risk agent. If approved, D0 places the trade. Each agent is a specialist communicating through a standard interface, independently upgradeable and replaceable.

```
┌──────────┐    ┌───────────┐    ┌────────────┐
│ SENTINEL │───→│ EXECUTION │───→│   D0 CLI   │───→ ON-CHAIN
│  AGENT   │    │   AGENT   │    │            │
└──────────┘    └─────┬─────┘    └────────────┘
                      │
                ┌─────▼─────┐
                │   RISK    │
                │   AGENT   │
                └───────────┘
```

## The Takeaway

The agentic trading stack is not a vision document. It's an architectural reality that's being built right now. The 5 layers — Intent, Understanding, Strategy, Execution, Settlement — are the complete decomposition of every trade. Most tools cover one or two. The defensible position is the execution layer, because it's the narrow waist of the stack: every intent, every strategy, every signal must eventually pass through execution to become a real position.

> The execution layer is to trading what the compiler is to programming. Everything above it is abstraction. Everything below it is implementation. Own the execution layer, and you become the interface between intelligence and action.

Three things that will likely be true by 2028:

1. **CLI-as-API will be the dominant integration pattern for AI agents.** Not REST APIs. Not SDKs. Not GraphQL. Text-in, text-out command interfaces that map perfectly to LLM function calling. The tooling ecosystem will converge on this.

2. **Non-custodial execution will be table stakes, not a feature.** After FTX, after every custodial exploit, the market will demand mathematical guarantees over corporate promises. Agents managing significant capital will refuse custodial architectures entirely. EIP-712 local signing will be the default.

3. **Exchange abstraction will determine which agents survive.** The crypto landscape adds new protocols quarterly. Agents hard-coded to one exchange's API will break. Agents built on an abstraction layer that absorbs protocol complexity will adapt without code changes. The abstraction layer becomes the competitive moat.

The teams building at the execution layer today are building the infrastructure that every AI trading agent will depend on tomorrow. The intent layer is commoditized — every LLM can parse "buy ETH." The strategy layer is competitive but replaceable — there are a thousand ways to generate alpha. The execution layer is structural. It's the bridge between reasoning and reality.

And bridges, historically, are very good businesses.
