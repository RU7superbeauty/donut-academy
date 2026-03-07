---
title: "DR-002: Cross-Protocol Unified Execution Semantics"
subtitle: "A perpetual contract on Hyperliquid and a binary outcome on Polymarket are fundamentally different instruments. The agent shouldn't need to know that."
date: "2026-03-07"
author: "Donut Research"
category: "RESEARCH"
tags: ["Cross-Protocol", "Abstraction", "Execution", "Semantic Design", "DR-002"]
description: "An analysis of the semantic gap between crypto trading protocols and how to design an abstraction layer that unifies execution without losing protocol-specific capabilities."
---

Here's a question that sounds simple until you try to implement it: what does "buy" mean?

On Hyperliquid, "buy" means opening a long perpetual contract position with continuous funding payments, adjustable leverage, and a liquidation price determined by your margin. On Polymarket, "buy" means purchasing outcome shares in a binary event market that resolves to $0 or $1 at a specific date. On a DEX like Jupiter on Solana, "buy" means swapping one token for another at the current AMM price with slippage tolerance.

Same word. Three completely different operations. Different order types, different settlement mechanics, different fee structures, different risk profiles, different position representations, different exit procedures.

An AI agent told to "buy ETH" needs to know which of these operations it's performing. But an AI agent designed for humans shouldn't require the human to specify. The human says "buy ETH." The agent figures out the rest. That's the promise of intent-centric execution — and the semantic gap between protocols is the hardest obstacle in the way.

## Phase 1: The Semantic Gap in Concrete Terms

Let's be specific about what differs across protocols. These aren't minor implementation details — they're fundamental differences in what a trade *is*.

### Order Semantics

**Hyperliquid (perpetual contracts)**:
- Orders are leveraged positions with continuous settlement
- A "buy" opens or adds to a long position
- Position exists until explicitly closed or liquidated
- P&L is unrealized until position close
- Funding rate payments every 8 hours (long pays short, or vice versa)
- Order types: market, limit, stop-market, stop-limit, take-profit

**Polymarket (prediction markets)**:
- Orders are share purchases in binary outcome markets
- A "buy" acquires shares priced between $0.01 and $0.99
- Position exists until market resolution or explicit sale
- P&L realized at resolution ($0 or $1 per share)
- No funding payments — cost is the share price
- Order types: market, limit (via CLOB on Polygon)

**DEX spot swaps (Jupiter, Uniswap, etc.)**:
- Orders are immediate token exchanges via automated market makers or order books
- A "buy" is an atomic swap: token A for token B
- No "position" exists — you simply hold the bought token
- P&L is the token's price change after purchase
- No ongoing costs except opportunity cost
- Order types: market (with slippage tolerance), limit (on some DEXes)

### Settlement Mechanics

| Property | Hyperliquid | Polymarket | DEX Spot |
|---|---|---|---|
| Settlement timing | Continuous (mark-to-market) | At event resolution | Immediate (atomic swap) |
| Settlement asset | USDC margin | USDC (via Polygon) | Output token |
| Position representation | Long/short with entry price | Share count (Yes/No) | Token balance |
| Leverage | 1-50x configurable | None (1x) | None (1x) |
| Liquidation risk | Yes (margin-based) | No (fully collateralized) | No |
| Fee structure | Maker/taker + funding rate | Trading fee only | Swap fee + gas + price impact |
| Exit mechanism | Close position (opposite trade) | Sell shares or wait for resolution | Swap back |

### Position Representation

This is where the semantic gap becomes most problematic for abstraction. A "position" means something different on each protocol:

On Hyperliquid, a position is:
```json
{
  "asset": "ETH",
  "side": "long",
  "size": 0.5,
  "entry_price": 3400.00,
  "leverage": 5,
  "margin": 340.00,
  "liquidation_price": 2780.00,
  "unrealized_pnl": 25.50,
  "funding_accumulated": -2.30
}
```

On Polymarket, a position is:
```json
{
  "market": "Will ETH reach $5000 by June 2026?",
  "outcome": "Yes",
  "shares": 500,
  "avg_cost": 0.35,
  "current_price": 0.42,
  "resolution_date": "2026-06-30",
  "potential_payout": 500.00,
  "cost_basis": 175.00
}
```

On a DEX, a position is just a balance:
```json
{
  "token": "ETH",
  "balance": 0.5,
  "acquisition_cost": 1700.00,
  "current_value": 1725.00
}
```

An agent managing a portfolio across all three protocols needs a unified representation that captures the economically relevant properties of each position type without forcing them into a single structure that distorts their semantics.

## Phase 2: Why a Naive Wrapper Fails

The tempting first approach is to build a thin wrapper — map every protocol's API to a common interface with methods like `buy()`, `sell()`, `get_position()`, `close()`. This works for about two weeks.

Then you hit the edge cases:

**Problem 1: Asymmetric operations.** Hyperliquid supports adjusting leverage on an open position. Polymarket doesn't have leverage. A DEX doesn't have "positions" to adjust. If your abstraction includes a `set_leverage()` method, it's meaningless for two of the three protocols. If it doesn't include one, you've lost critical Hyperliquid functionality.

**Problem 2: Different risk models.** Closing a position on Hyperliquid might trigger a liquidation cascade if done too quickly (market impact). Selling prediction market shares might be impossible if there's no liquidity on the opposite side. Swapping back on a DEX might incur massive slippage during volatility. The risk computation is fundamentally different for each protocol, and a unified `close()` method that doesn't account for these differences will blow up in production.

**Problem 3: Protocol-specific features that create value.** Polymarket allows "buying No shares" — effectively shorting the outcome — without borrowing or margin. Hyperliquid's cross-margin mode lets multiple positions share a margin pool. Jupiter routes through multiple AMMs to find the best price. These features are competitive advantages, not implementation details. An abstraction that hides them hides the value.

**Problem 4: Error semantics diverge.** A "insufficient balance" error on Hyperliquid means you don't have enough margin for the position at the specified leverage. On Polymarket, it means you don't have enough USDC to buy the shares. On a DEX, it means you don't have enough of the input token. The same error concept requires different remediation on each protocol.

The naive wrapper creates a lowest-common-denominator interface that makes simple things possible and important things impossible. It's the classic "leaky abstraction" problem — but in finance, leaky abstractions don't just cause bugs, they cause losses.

## Phase 3: The Right Abstraction Layer

The solution isn't to pretend the protocols are the same. It's to identify what *is* genuinely common — the semantic core that all trading operations share — while providing clean extension points for protocol-specific capabilities.

### The Common Semantic Core

Every trade across every protocol resolves to five fundamental questions:

1. **What** — the asset or event being traded
2. **Which direction** — are you expressing a positive or negative view?
3. **How much** — what is the size of the position in economic terms?
4. **At what price** — what execution price is acceptable?
5. **With what risk bounds** — what are the maximum acceptable losses?

These five dimensions form the **command grammar** — the minimal set of parameters that every trading operation must specify, regardless of protocol:

```
d0 trade <asset> <direction> <size>
    --exchange <protocol>
    --price <limit_price | "market">
    --risk <stop_loss_percent>
```

Concrete examples:

```bash
# Hyperliquid perpetual long
d0 trade ETH long 0.5 --exchange hyperliquid --price market --risk 5%

# Polymarket outcome purchase
d0 trade "ETH > $5000 by June" yes 500shares --exchange polymarket --price 0.35 --risk none

# DEX spot swap
d0 trade ETH buy 0.5 --exchange jupiter --price market --risk slippage:1%
```

The command grammar is intentionally sparse. It captures the five universal dimensions without imposing protocol-specific constraints. But it also doesn't *prevent* protocol-specific parameters.

### Protocol Extension Points

Beyond the common core, each protocol can accept additional parameters via a consistent extension mechanism:

```bash
# Hyperliquid-specific: leverage, margin mode
d0 trade ETH long 0.5 --exchange hyperliquid \
    --leverage 5 \
    --margin-mode cross \
    --take-profit 3600

# Polymarket-specific: resolution date filter, outcome type
d0 trade "ETH > $5000" yes 500shares --exchange polymarket \
    --resolve-by 2026-06-30 \
    --order-type limit

# Jupiter-specific: route optimization, slippage
d0 trade ETH buy 0.5 --exchange jupiter \
    --slippage 0.5% \
    --route best-price
```

The principle: **core semantics are mandatory and universal; extensions are optional and protocol-specific.** An agent that only knows the core semantics can trade on any protocol. An agent that understands a protocol's extensions can trade more effectively on that specific protocol.

This layered approach means that when a new protocol is added, the core grammar doesn't change — only a new set of extensions is defined.

## Phase 4: The Translation Layer

Between the unified command grammar and each protocol's native API sits a **translation layer** — the component that transforms abstract trading intent into protocol-specific API calls.

The translation layer has three responsibilities:

### 1. Parameter Mapping

Map common parameters to protocol-specific equivalents:

```
COMMON              → HYPERLIQUID            → POLYMARKET
────────────────────────────────────────────────────────────
direction: "long"   → side: "BUY"            → outcome: "YES"
direction: "short"  → side: "SELL"            → outcome: "NO"
size: 0.5           → quantity: 0.5           → shares: 50 (at $0.01/share)
price: "market"     → type: "MARKET"          → type: "FOK" (fill-or-kill)
risk: "5%"          → stop_loss_price: calc   → (no native stop-loss)
```

Notice the asymmetry: Polymarket doesn't have native stop-loss orders. The translation layer must handle this — either by implementing a client-side stop-loss monitor or by warning the agent that risk bounds cannot be enforced natively.

### 2. Default Inference

Fill missing parameters with protocol-appropriate defaults:

```python
DEFAULTS = {
    "hyperliquid": {
        "leverage": 1,          # Conservative: no leverage
        "margin_mode": "isolated",  # Limit blast radius
        "order_type": "limit",      # Avoid slippage
    },
    "polymarket": {
        "order_type": "limit",      # CLOB prefers limits
        "shares": "auto",           # Infer from size in USDC
    },
    "jupiter": {
        "slippage": "1%",           # Standard DEX tolerance
        "route": "best-price",      # Optimize execution
    }
}
```

Default inference is where the translation layer adds the most value for agents. An agent that says `d0 trade ETH long 0.5 --exchange hyperliquid` gets isolated margin at 1x leverage with a limit order — the safest possible interpretation.

### 3. Validation and Pre-Flight Checks

Before translating to native API calls, validate that the command is semantically valid for the target protocol:

```
VALIDATION RULES:
─────────────────
• Hyperliquid: leverage must be 1-50x for supported assets
• Polymarket: market must exist and be active (not resolved)
• Jupiter: input token must have sufficient AMM liquidity
• ALL: position size must not exceed portfolio risk limits
```

Pre-flight validation catches semantic errors that are valid in the abstract grammar but invalid on the target protocol. "Short ETH with 100x leverage on Polymarket" is a grammatically valid command that makes no semantic sense.

## Phase 5: Adding New Protocols Without Breaking Existing Code

One of the hardest requirements for the abstraction layer: extending it to support new protocols must not break existing agent code. An agent written for Hyperliquid and Polymarket should continue to work unchanged when Jupiter support is added.

This requires a strict separation of concerns:

**The protocol adapter interface:**

```python
class ProtocolAdapter:
    """Every protocol implements this interface."""

    def translate(self, common_order: CommonOrder) -> NativeOrder:
        """Convert common semantics to native API call."""

    def validate(self, common_order: CommonOrder) -> ValidationResult:
        """Check if this order is valid on this protocol."""

    def get_position(self, asset: str) -> CommonPosition:
        """Return current position in common format."""

    def supported_extensions(self) -> list[str]:
        """List protocol-specific parameters this adapter accepts."""
```

New protocols are added by implementing this interface. The core system discovers adapters at runtime. No existing code changes.

**The extension negotiation pattern:**

When an agent sends a command with protocol-specific extensions, the system checks whether the target protocol supports those extensions:

```
Agent: d0 trade ETH long 0.5 --exchange polymarket --leverage 5

System: WARNING — Polymarket does not support leverage.
        Removing --leverage parameter.
        Proceeding with 1x (shares purchase).
```

The agent gets a clear warning that its intent couldn't be fully expressed on the target protocol. This is better than silently ignoring the parameter (which would surprise the agent) or throwing an error (which would block execution).

## Phase 6: Testing Semantic Equivalence

How do you verify that `d0 trade ETH long 0.5` does the "same thing" on Hyperliquid and Jupiter? You can't — because they're fundamentally different operations. But you can verify **economic equivalence**: that the financial exposure resulting from the command is comparable.

Economic equivalence means:

1. **Directional exposure is the same.** A "long" on both protocols gains value when ETH price increases.
2. **Notional exposure is comparable.** 0.5 ETH notional on Hyperliquid (perpetual) ≈ 0.5 ETH held on Jupiter (spot), adjusted for leverage.
3. **Cost basis is transparent.** The total cost to enter the position — including fees, funding estimates, and price impact — is reported consistently.

Testing this requires a simulation framework that can execute the same abstract command against multiple protocol adapters and compare the resulting positions:

```python
def test_semantic_equivalence(command, protocols):
    """Verify that a command produces comparable exposure across protocols."""
    positions = {}
    for protocol in protocols:
        adapter = get_adapter(protocol)
        # Simulate execution (no real trades)
        result = adapter.simulate(command)
        positions[protocol] = {
            "direction": result.direction,
            "notional_usd": result.notional_value_usd,
            "cost_usd": result.total_cost_usd,
            "max_loss_usd": result.max_possible_loss_usd,
        }

    # Check directional consistency
    directions = set(p["direction"] for p in positions.values())
    assert len(directions) == 1, f"Direction mismatch: {positions}"

    # Check notional is within 5% tolerance
    notionals = [p["notional_usd"] for p in positions.values()]
    assert max(notionals) / min(notionals) < 1.05, f"Notional divergence: {positions}"

    return positions
```

The 5% tolerance acknowledges that exact equivalence is impossible — different fee structures, price impact models, and settlement mechanics mean the same $1,000 trade costs slightly different amounts on each protocol. The test verifies that the abstraction preserves *intent*, not exact numerical equality.

## Phase 7: The Exchange Abstraction Table

The landing page references D0's exchange abstraction as a core architectural principle. Here's what that looks like in practice — the semantic mapping that the translation layer implements:

| Concept | Hyperliquid | Polymarket | DEX (Jupiter) |
|---|---|---|---|
| Asset reference | Ticker symbol (ETH) | Market question | Token address / symbol |
| Long exposure | Buy perpetual | Buy "Yes" shares | Buy token |
| Short exposure | Sell perpetual | Buy "No" shares | Sell token (if held) |
| Position sizing | Contracts × leverage | Number of shares × price | Token quantity |
| Risk management | Stop-loss order (native) | Client-side monitoring | Slippage tolerance |
| Fee model | Maker/taker + funding | Flat trading fee | Swap fee + gas |
| Settlement | Continuous margin | Binary at resolution | Immediate atomic |
| Exit | Close position | Sell shares or wait | Swap back |

The agent doesn't need to memorize this table. It says what it wants in the common grammar, and the translation layer handles the mapping. But the agent *can* access this information — understanding the differences helps it make better trading decisions, even if it doesn't need to implement them.

## Open Questions

Several problems in cross-protocol semantics remain genuinely unsolved:

**1. Cross-protocol hedging.** If an agent is long ETH perpetual on Hyperliquid and wants to hedge with a Polymarket "ETH below $3000" position, how does the abstraction layer express the relationship between these positions? They're on different protocols with different settlement mechanics, but they're economically linked.

**2. Unified P&L reporting.** A portfolio spanning perpetuals, prediction market shares, and spot tokens has no single "P&L" number. Unrealized P&L on a perpetual, potential resolution value on a prediction market position, and mark-to-market on spot holdings are different concepts that can't be meaningfully summed without significant assumptions.

**3. Atomic cross-protocol execution.** "Sell ETH perpetual on Hyperliquid and simultaneously buy ETH spot on Jupiter" requires coordinating two independent transactions. If one succeeds and the other fails, the portfolio is in an unintended state. True atomic cross-protocol execution doesn't exist today.

**4. Protocol risk aggregation.** The total portfolio risk isn't the sum of individual protocol risks. Margin calls on Hyperliquid interact with liquidity needs for Polymarket positions. A unified risk model must understand cross-protocol dependencies.

These open questions define the research frontier for DR-002. The abstraction layer described here handles the common case — a single trade on a single protocol, expressed in unified semantics. The multi-protocol, multi-position, cross-hedged case is where the real complexity lies, and where the next generation of AI trading infrastructure will be built.
