---
title: "Building Your First Agentic Trading Pipeline: A Practical Guide"
subtitle: "From data ingestion to execution to feedback loops — a step-by-step guide to constructing an autonomous trading pipeline with D0."
date: "2026-03-07"
author: "Donut Research"
category: "D0 METHOD"
tags: ["Pipeline", "D0 CLI", "Agent Architecture", "Trading Infrastructure"]
description: "A practical, step-by-step guide to building an agentic trading pipeline — covering data ingestion, signal generation, risk assessment, execution, monitoring, and feedback loops using D0 as the execution layer."
---

There's a gap between understanding trading concepts and having a working system. You can know everything about calibration, Kelly criterion, and market microstructure — and still have nothing that executes a trade.

This guide bridges that gap. Six steps, each building on the previous one, each producing a functional component that can be tested independently and upgraded separately. By the end, you'll have an autonomous trading pipeline: data comes in, signals get generated, risk gets assessed, trades get executed, and the system learns from its outcomes.

No magic. No black boxes. Every step is inspectable, every decision is logged, every component can be swapped out without touching the others. That's the composable approach — and it's why agent-native infrastructure matters.

## Step 1: The Data Layer — Feeding Your Agent

An agent without data is just an expensive random number generator. The data layer is the foundation of everything else, and getting it right means answering three questions: what data, from where, and how fresh?

**Price data** is the baseline. Current prices, historical candles (OHLCV), and order book depth are the minimum for any trading strategy. For crypto, this means pulling from on-chain sources (DEX prices, AMM pool states) and off-chain sources (CEX APIs, aggregators).

Using D0, basic price data access requires zero configuration:

```bash
# Current price — requires d0 login first
d0 price SOL

# Technical analysis (includes candles, RSI, MACD)
d0 ta ETH

# Token research (fundamentals + on-chain)
d0 research ETH
```

**On-chain metrics** add a layer that traditional finance doesn't have: transparent, real-time data about market participant behavior. Funding rates, open interest, liquidation levels, whale wallet activity — all visible on-chain.

```bash
# Funding rate + positions on HyperLiquid
d0 hl:positions

# Account balance on HyperLiquid
d0 hl:balance

# Portfolio overview (wallet + perps + HL)
d0 balance
```

**News and sentiment** are where the LLM's natural language capabilities add genuine value. The agent can process news feeds, social media, and on-chain governance proposals to extract signals that pure quantitative systems miss.

The data layer architecture should follow a principle: **raw data in, structured data out**. Every data source gets normalized into a consistent format before reaching the signal generation layer. This decouples data sourcing from signal logic — if you switch from one exchange to another, only the data layer changes.

```
Data Layer Architecture:
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│ Price Feeds  │  │ On-Chain     │  │ News/Social  │
│ (D0 CLI)     │  │ (D0 CLI)     │  │ (RSS/API)    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  ┌──────▼───────┐
                  │ Normalizer   │
                  │ (timestamp,  │
                  │  format,     │
                  │  validation) │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │ Data Store   │
                  │ (local cache │
                  │  + history)  │
                  └──────────────┘
```

**Common mistake #1: No data validation.** APIs return garbage sometimes — stale prices, zero volumes, impossible values. Every data point should pass sanity checks before entering the pipeline. A single corrupted price feed can trigger a cascade of bad trades.

```python
def validate_price(price, symbol, history):
    if price <= 0:
        raise DataError(f"Non-positive price: {price}")
    if history and abs(price / history[-1] - 1) > 0.5:
        raise DataError(f"Price moved >50% in one interval: {price}")
    return price
```

## Step 2: Signal Generation — Structuring LLM Prompts for Trading

Signal generation is where the LLM earns its keep. The goal: transform raw data into actionable trading signals — probability estimates with confidence intervals.

The critical insight: **prompt structure determines signal quality.** A vague prompt ("Is ETH going up?") produces vague output. A structured prompt that enforces step-by-step reasoning produces calibrated probability estimates.

Here's the prompt architecture that works:

```
SYSTEM: You are a quantitative trading analyst. Your task is to
estimate the probability of specific market events. Reason step by
step. Consider base rates, recent data, and potential confounders.
Express your final estimate as a specific percentage with a
confidence range.

USER:
Event: {event_description}
Current market data:
- Price: {current_price}
- 24h change: {change_24h}
- Volume: {volume}
- Funding rate: {funding_rate}

Recent news context:
{news_summary}

Historical base rate for similar events: {base_rate}

Step 1: What is the base rate for this type of event?
Step 2: What evidence supports a probability above the base rate?
Step 3: What evidence supports a probability below the base rate?
Step 4: Synthesize into a final probability estimate with range.
```

**Chain-of-thought prompting improves calibration.** Research consistently shows that asking an LLM to reason step-by-step before giving a final answer produces better-calibrated probability estimates. The improvement is typically 2-4 ECE points — meaningful in a trading context where small calibration improvements translate to real edge.

**Multiple samples reduce variance.** Running the same prompt 3-5 times and averaging the probability estimates reduces the variance of the signal. The mean of multiple LLM samples is more stable than any single sample, particularly for events where the model is uncertain.

```python
def generate_signal(event, market_data, n_samples=5):
    estimates = []
    for _ in range(n_samples):
        response = llm.complete(
            build_structured_prompt(event, market_data)
        )
        prob = extract_probability(response)
        estimates.append(prob)

    signal = {
        "event": event,
        "raw_probability": mean(estimates),
        "uncertainty": std(estimates),
        "n_samples": n_samples,
        "timestamp": now()
    }
    return signal
```

**Calibration correction follows signal generation.** The raw LLM output goes through a calibration correction layer (Platt scaling or isotonic regression, trained on historical resolved predictions) before being used for any trading decision. Never trade on raw LLM output — the systematic biases documented in calibration research mean the raw numbers are predictably wrong.

```python
def calibrate_signal(raw_signal, calibrator):
    corrected_prob = calibrator.transform(raw_signal["raw_probability"])
    return {
        **raw_signal,
        "corrected_probability": corrected_prob,
        "calibration_method": calibrator.method,
        "calibrator_version": calibrator.version
    }
```

**Common mistake #2: Treating LLM output as ground truth.** The LLM is a signal source, not an oracle. Its output should be one input to the trading decision, weighted by its historical calibration performance. An agent that blindly follows LLM probability estimates will inherit all of the model's systematic biases.

## Step 3: Risk Assessment — The Multi-Gate Framework in Practice

Between signal generation and execution sits the risk assessment layer — a series of independent checks that every trade candidate must pass. This is the multi-gate framework, and it's where most of the alpha preservation happens.

**Gate 1: Edge Threshold**

Compare the calibration-corrected probability to the market price. Only proceed if the edge exceeds the minimum threshold (typically: transaction costs + model ECE + safety margin).

```python
def edge_gate(corrected_prob, market_price, costs, model_ece):
    direction = "BUY" if corrected_prob > market_price else "SELL"
    edge = abs(corrected_prob - market_price)
    min_edge = costs + model_ece + SAFETY_MARGIN  # e.g., 0.03

    if edge < min_edge:
        return GateResult(passed=False, reason="Edge below threshold")

    return GateResult(
        passed=True,
        direction=direction,
        edge=edge
    )
```

**Gate 2: Position Sizing**

Apply fractional Kelly criterion to determine bet size. Cap at the maximum per-position allocation.

```python
def sizing_gate(edge, win_prob, odds, bankroll):
    # Kelly formula
    kelly_fraction = (win_prob * odds - (1 - win_prob)) / odds
    kelly_fraction = max(0, kelly_fraction)  # Never negative

    # Fractional Kelly (quarter-Kelly for safety)
    position_size = bankroll * kelly_fraction * 0.25

    # Hard cap
    max_size = bankroll * MAX_POSITION_PCT  # e.g., 0.05
    position_size = min(position_size, max_size)

    if position_size < MIN_TRADE_SIZE:
        return GateResult(passed=False, reason="Position too small")

    return GateResult(passed=True, size=position_size)
```

**Gate 3: Conflict Detection**

Check whether multiple information sources agree. If the LLM says 70% but the base rate for similar events is 30%, and news sentiment is neutral, something is wrong — either the LLM is hallucinating signal, or the base rate is outdated. Either way, the trade should be flagged.

```python
def conflict_gate(corrected_prob, base_rate, news_sentiment):
    sources = [corrected_prob, base_rate, news_sentiment]
    max_disagreement = max(sources) - min(sources)

    if max_disagreement > CONFLICT_THRESHOLD:  # e.g., 0.15
        return GateResult(
            passed=False,
            reason=f"Source disagreement: {max_disagreement:.0%}"
        )

    return GateResult(passed=True)
```

**Gate 4: Portfolio Constraints**

Verify that adding this position doesn't violate portfolio-level constraints: maximum correlated exposure, maximum total deployment, drawdown limits.

```python
def portfolio_gate(trade, portfolio):
    # Correlation check
    if portfolio.correlation_with(trade) > MAX_CORRELATION:
        return GateResult(passed=False, reason="Correlated exposure")

    # Total deployment check
    total_deployed = portfolio.total_deployed + trade.size
    if total_deployed > MAX_DEPLOYMENT * portfolio.value:
        return GateResult(passed=False, reason="Max deployment reached")

    # Drawdown check
    if portfolio.drawdown() > MAX_DRAWDOWN:
        trade.size *= 0.5  # Auto-reduce during drawdowns

    return GateResult(passed=True, adjusted_size=trade.size)
```

All four gates must pass before a trade reaches the execution layer. The gates are independent — each catches failure modes that the others miss. A trade with genuine edge but correlated exposure gets caught by Gate 4. A trade with apparent edge but conflicting signals gets caught by Gate 3. A trade that's too small to matter gets caught by Gate 2.

**Common mistake #3: Skipping risk gates because the signal "looks strong."** Every blown-up trading account has the same story: "The signal was so clear that I skipped my normal checks." The gates exist precisely for the cases where the signal looks strongest — because those are the cases where confirmation bias is most dangerous.

## Step 4: Execution — From Decision to On-Chain Position

Once a trade passes all gates, execution is straightforward — if you have the right infrastructure.

D0's CLI-as-API architecture means the agent calls the same commands a human trader would, with the same semantics and the same risk protections:

```bash
# Simple market buy
d0 trade buy SOL --size 10 --exchange hyperliquid

# Limit order with stop-loss
d0 trade buy ETH --size 0.5 --price 3200 --stop-loss 3100 \
  --exchange hyperliquid

# Prediction market position
d0 trade polymarket --market "event-slug" --side YES \
  --size 100 --max-price 0.35

# Close position
d0 trade close ETH --exchange hyperliquid
```

**Execution best practices for agents:**

**1. Use limit orders, not market orders.** Market orders execute at whatever price is available — in thin markets, that means significant slippage. Limit orders set a maximum price, protecting against adverse fills. The trade-off is that limit orders may not fill if the price moves away, but unfilled orders are always better than overpaying.

**2. Split large orders.** If the Kelly-recommended position is $5,000 but the order book depth at your target price is only $2,000, split the order into multiple smaller fills over time. This reduces market impact and avoids signaling your intent to other agents.

```bash
# Instead of one large order:
d0 trade buy ETH --size 2.0 --exchange hyperliquid

# Split into smaller chunks:
d0 trade buy ETH --size 0.5 --price 3200 --exchange hyperliquid
# wait, check fill
d0 trade buy ETH --size 0.5 --price 3201 --exchange hyperliquid
# wait, check fill
d0 trade buy ETH --size 0.5 --price 3202 --exchange hyperliquid
# ...
```

**3. Always set stop-losses.** No position should exist without a predefined exit point for adverse scenarios. The stop-loss level should be based on the strategy's risk parameters, not on arbitrary round numbers.

**4. Verify execution.** After placing an order, confirm it was filled at the expected price. Slippage happens, and the actual fill price determines your real edge — not the price you intended.

```bash
# Check position after execution
d0 hl:positions

# Verify open orders
d0 hl:orders
```

**Common mistake #4: No stop-loss.** The most expensive three words in trading: "It'll come back." An agent without stop-losses will hold losing positions indefinitely, tying up capital and accumulating unrealized losses. Every position needs a stop.

## Step 5: Monitoring — Tracking What Matters

Once positions are live, monitoring becomes critical. The agent needs to track three things: position status, P&L, and alert conditions.

**Position tracking** means knowing, at all times, what positions are open, their current value, and their distance from stop-loss levels.

```bash
# Current positions with P&L
d0 hl:positions

# Portfolio overview including fills history
d0 hl:fills
```

**P&L calculation** should be running continuously, decomposed into components:

```
Realized P&L = Σ(closed_position_profits)
Unrealized P&L = Σ(current_value - entry_value) for open positions
Total P&L = Realized + Unrealized
Fees paid = Σ(all transaction fees)
Net P&L = Total P&L - Fees
```

**Alert thresholds** define when the agent should act — either by adjusting positions or by escalating to human review:

```python
ALERT_THRESHOLDS = {
    "position_loss_pct": -0.10,      # Position down 10% from entry
    "portfolio_drawdown": -0.15,      # Portfolio down 15% from peak
    "correlation_spike": 0.7,         # Positions becoming correlated
    "liquidity_drop": 0.5,            # Market liquidity dropped 50%
    "funding_rate_extreme": 0.001,    # Funding rate >0.1% per interval
}

def check_alerts(portfolio, markets):
    alerts = []
    for position in portfolio.positions:
        if position.pnl_pct < ALERT_THRESHOLDS["position_loss_pct"]:
            alerts.append(Alert("POSITION_LOSS", position))
    if portfolio.drawdown() < ALERT_THRESHOLDS["portfolio_drawdown"]:
        alerts.append(Alert("DRAWDOWN_BREACH", portfolio))
    return alerts
```

**Common mistake #5: Ignoring correlation.** Two positions that look independent can become correlated during market stress. An agent holding "Yes" on "Will crypto regulation pass?" and "No" on "Will crypto prices rise?" has a correlated bet — both go wrong if regulation passes and is market-friendly. Monitor correlation dynamically, not just at entry.

## Step 6: The Feedback Loop — Learning From Outcomes

The feedback loop is what separates a static trading system from a learning one. Every resolved trade is data — data that can be used to improve calibration, refine risk parameters, and identify strategy decay.

**Prediction logging** captures everything the agent knew and believed at the time of the trade:

```python
trade_log = {
    "event_id": "polymarket-xyz",
    "timestamp": "2026-03-07T14:30:00Z",
    "raw_llm_probability": 0.62,
    "calibrated_probability": 0.57,
    "market_price_at_entry": 0.48,
    "edge_at_entry": 0.09,
    "position_direction": "YES",
    "position_size": 250.00,
    "kelly_fraction_used": 0.25,
    "gates_passed": ["edge", "sizing", "conflict", "portfolio"],
    "outcome": None,  # Filled on resolution
    "resolution_date": None,
    "actual_pnl": None
}
```

**Calibration recalibration** uses resolved predictions to update the Platt scaling or isotonic regression model that corrects raw LLM output:

```python
def recalibrate(trade_log, min_samples=50):
    resolved = [t for t in trade_log if t["outcome"] is not None]
    if len(resolved) < min_samples:
        return  # Not enough data yet

    raw_probs = [t["raw_llm_probability"] for t in resolved]
    outcomes = [t["outcome"] for t in resolved]

    # Refit calibrator on recent data
    calibrator.fit(raw_probs, outcomes)

    # Evaluate new calibration
    new_ece = compute_ece(calibrator.predict(raw_probs), outcomes)
    log(f"Recalibrated: ECE = {new_ece:.4f}, n = {len(resolved)}")
```

**Strategy performance tracking** identifies whether the edge is decaying. If the rolling Sharpe ratio or hit rate is declining, the strategy may be getting crowded (alpha decay) or the market regime may have shifted.

```python
def check_strategy_health(trade_log, window=100):
    recent = trade_log[-window:]
    resolved = [t for t in recent if t["outcome"] is not None]

    if len(resolved) < 30:
        return "INSUFFICIENT_DATA"

    hit_rate = mean([1 if t["actual_pnl"] > 0 else 0 for t in resolved])
    avg_edge = mean([t["edge_at_entry"] for t in resolved])
    realized_sharpe = compute_sharpe([t["actual_pnl"] for t in resolved])

    if realized_sharpe < 0.5:
        return "STRATEGY_DEGRADED"
    if hit_rate < 0.45:
        return "HIT_RATE_DECLINING"
    if avg_edge < MIN_EDGE * 1.5:
        return "EDGE_COMPRESSING"

    return "HEALTHY"
```

**Walk-forward recalibration timing** matters. Recalibrate too often and you overfit to noise. Recalibrate too rarely and you miss genuine distribution shifts. A practical schedule: recalibrate after every 100 resolved predictions, using the most recent 500 data points as the training window. This provides enough data for stable parameter estimation while remaining responsive to distributional changes.

**Common mistake #6: Backtesting without walk-forward.** If you backtest your strategy on historical data using a simple train/test split, your performance estimates are systematically too optimistic — research suggests 30-60% overestimation on financial data (Bailey et al., "The Probability of Backtest Overfitting," 2015). Walk-forward validation, where the model is retrained on a rolling window and tested on genuinely unseen future data, is the only methodology that produces realistic performance estimates.

## The Composable Architecture

Each of the six steps is an independent module:

```
┌───────────┐    ┌──────────┐    ┌──────────┐
│ 1. DATA   │───>│ 2. SIGNAL│───>│ 3. RISK  │
│           │    │          │    │          │
│ D0 reads  │    │ LLM +    │    │ Multi-   │
│ + feeds   │    │ calibrate│    │ gate     │
└───────────┘    └──────────┘    └────┬─────┘
                                     │
┌───────────┐    ┌──────────┐    ┌───▼──────┐
│ 6. LEARN  │<───│ 5. WATCH │<───│ 4. EXEC  │
│           │    │          │    │          │
│ Recalib + │    │ P&L +    │    │ D0 trade │
│ health    │    │ alerts   │    │ commands │
└───────────┘    └──────────┘    └──────────┘
```

The composable approach means each module can be upgraded independently:

- Swap the LLM in Step 2 without touching the risk framework in Step 3
- Add a new exchange in Step 4 without changing the signal generation in Step 2
- Improve the calibration model in Step 6 without rebuilding the data layer in Step 1
- Add new risk gates in Step 3 without modifying the monitoring in Step 5

This is why D0's design as a CLI-based execution layer matters. The agent doesn't need a custom SDK or a complex API integration for each exchange. It calls `d0 trade` commands — the same interface regardless of what's upstream (signal generation) or downstream (monitoring). The execution layer is a standard component, not a custom integration.

Each step is also a natural boundary for a **Skill** in the Clawhub ecosystem. A data collection Skill, a signal generation Skill, a risk management Skill, an execution Skill, a monitoring Skill — each developed and maintained independently, each composable with the others. An agent can mix and match: use one team's signal generation with another team's risk framework, all executing through D0.

> The best trading pipeline is not the most sophisticated one. It's the most composable one — where every component can be inspected, tested, replaced, and upgraded independently. Complexity in trading systems doesn't come from any single component. It comes from tight coupling between components. Keep them loose.

Start simple. One data source, one signal strategy, one risk gate, one execution path. Get the full loop working end to end. Then upgrade each component one at a time, measuring the impact at every step. The pipeline that compounds improvements is the pipeline that wins.
