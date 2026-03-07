---
title: "LLM Probability Calibration: Can AI Actually Price Risk?"
subtitle: "LLMs are systematically miscalibrated on tail probabilities. Understanding this bias is the key to building profitable prediction market agents."
date: "2026-02-20"
author: "Donut Research"
category: "RESEARCH"
tags: ["LLM", "Calibration", "Prediction Markets", "Risk"]
description: "An empirical deep-dive into LLM probability calibration, the favorite-longshot bias, and how to build trading agents that actually price risk correctly."
---

Here's the thing nobody in the AI trading space wants to say out loud: your LLM doesn't know what 5% means.

I don't mean it can't parse the number. I mean that when an LLM tells you an event has a 5% chance of happening, the actual frequency of occurrence is systematically higher. That's not a rounding error. That's a systematic bias that will blow up your prediction market portfolio if you don't understand it — and it's also, paradoxically, the single biggest edge available to anyone building calibrated trading agents right now.

Research on LLM probability outputs against resolved prediction outcomes is revealing a clear pattern. The models aren't broken. They're predictably wrong, in ways that map precisely onto decades of behavioral economics research. And predictably wrong means exploitably wrong.

## Phase 1: What Calibration Actually Means

Calibration is the simplest concept in probability that almost everyone gets wrong. Here's the whole thing in one sentence: if you assign 70% probability to a class of events, those events should happen 70% of the time.

That's it. Not 65%. Not 80%. Seventy percent.

The way we measure this is with a **calibration curve**. You take all the predictions where a model said "70% likely," bucket them together, and check what fraction actually occurred. Then you do the same for 60%, 50%, 80%, every probability bin. Plot predicted probability on the x-axis, actual frequency on the y-axis. A perfectly calibrated model produces a diagonal line — the identity function. Predicted = actual.

> A perfectly calibrated model isn't necessarily accurate. It just means its confidence levels are honest. A model that says "I don't know" (50%) about everything is perfectly calibrated if it's right half the time. Calibration and accuracy are orthogonal properties.

The standard scoring metric is the **Brier score**:

```
Brier = (1/N) * Σ(predicted_i - actual_i)²
```

Where `predicted_i` is the probability assigned to event i, and `actual_i` is 1 if the event happened, 0 if it didn't. A Brier score of 0 means perfect prediction. A Brier score of 0.25 means you're performing at coin-flip level (always predicting 50%). Anything above 0.25, and you're actively harmful — worse than random.

For a more granular view of calibration specifically (as opposed to overall prediction quality), we use the **Expected Calibration Error (ECE)**:

```
ECE = Σ(|B_m| / N) * |acc(B_m) - conf(B_m)|
```

Where `B_m` is each probability bin, `acc(B_m)` is the actual accuracy within that bin, and `conf(B_m)` is the average predicted confidence within that bin. An ECE below 0.05 is considered well-calibrated. Most LLMs land between 0.08 and 0.15 on general forecasting tasks. That gap is where the money is.

Here's why this matters for trading: prediction markets are, at their core, probability markets. When you buy "Yes" on a Polymarket contract at 30 cents, you're saying the true probability is above 30%. When you sell at 70 cents, you're saying it's below 70%. Every position you take is a statement about calibration — yours versus the market's.

A miscalibrated agent doesn't just lose money randomly. It loses money *systematically*. It consistently overpays for certain types of events and consistently undervalues others. But here's the flip side: an agent that understands its own miscalibration — and corrects for it — can systematically extract edge from markets populated by miscalibrated participants.

The question is: how miscalibrated are LLMs, exactly? And in which direction?

## Phase 2: The Empirical Evidence — What We Know About LLM Calibration

The data here is more damning — and more useful — than most people realize.

**Zou et al. (2022), "Forecasting Future World Events with Neural Networks,"** conducted one of the first rigorous studies comparing language model forecasting performance against human superforecasters using Metaculus questions. Their headline finding was encouraging: LLMs approach human forecaster accuracy on well-defined, medium-probability questions. On events in the moderate probability range, the gap between LLM predictions and calibrated human ensembles was relatively small.

But here's what got buried in the paper: **the gap widens on tail events**. For questions with true probabilities at the extremes — below 10% or above 90% — LLM predictions diverged meaningfully from reality. The models were compressing extreme probabilities toward the center of the distribution, overestimating low-probability events and underestimating high-probability ones.

More recently, **Halawi et al. (2024), "Approaching Human-Level Forecasting with Language Models" (arXiv 2402.18563),** demonstrated that a carefully designed LLM pipeline — combining retrieval, chain-of-thought reasoning, and ensembling — can approach competitive human crowd forecast accuracy, and in some settings surpass it. This is a significant advance over raw model outputs, but the pipeline's complexity underscores that off-the-shelf LLM probability estimates remain miscalibrated without correction.

**Schoenegger et al. (2025), "Wisdom of the Silicon Crowd: LLM Ensemble Prediction Capabilities Rival Human Crowd Accuracy,"** found that an ensemble of 12 LLMs produces forecasts statistically indistinguishable from human crowd accuracy. The key insight: no single model is well-calibrated, but aggregation across models dramatically reduces systematic bias — analogous to how human superforecaster teams outperform individual forecasters.

The overall pattern across these studies is consistent. Models perform best in the middle of the distribution — the 40-60% range is roughly calibrated. The distortion is roughly symmetric: low probabilities tend to be overestimated, high probabilities tend to be underestimated. Larger models and ensemble approaches improve calibration, but no single model achieves perfect calibration across the full probability range.

> The core finding: LLMs compress the probability distribution toward the center. They're uncertainty-averse at both extremes. This creates a specific, exploitable pattern in any market where LLM-generated probabilities influence prices.

Why does this happen? Two reinforcing mechanisms. First, RLHF training penalizes confident wrong answers more than wishy-washy ones, incentivizing models to hedge toward the center. Second, the training data itself — human-written text — reflects human biases about probability. Humans are notoriously bad at reasoning about rare events, and models trained on human reasoning inherit that weakness.

This isn't going to be fixed with scale alone. GPT-4 is better calibrated than GPT-3.5, but the improvement is diminishing. The fundamental architecture of transformer-based language models — predicting the next token based on distributional patterns in training data — doesn't naturally produce calibrated probability estimates. It produces plausible-sounding ones, which is a very different thing.

## Phase 3: The Favorite-Longshot Bias Connection

Here's where the trading edge crystallizes.

In 2010, Snowberg and Wolfers published a landmark paper analyzing the favorite-longshot bias across horse racing, sports betting, and financial markets. The favorite-longshot bias is the empirical finding that longshots (low-probability outcomes) are systematically overpriced in betting markets, while favorites (high-probability outcomes) are systematically underpriced.

Their key conclusion: **"Misperception dominates risk-love."** People don't overpay for longshots because they enjoy gambling on unlikely events. They overpay because they genuinely believe those events are more likely than they actually are. It's a calibration failure, not a preference.

This maps directly onto the LLM calibration data. If language models are trained on human-generated text — which encodes human reasoning patterns, including probability misperception — then LLMs should exhibit the favorite-longshot bias. And they do. The compression pattern from Phase 2 is precisely this bias expressed through a neural network.

The implication for prediction markets is profound. Market prices are set by the aggregate activity of traders — some human, increasingly some AI-assisted. If both humans AND LLMs share the same directional bias on tail probabilities, the market price at the extremes will be systematically wrong.

Let me put numbers on this. Suppose a prediction market contract is trading at $0.08 (8% implied probability). If the true probability is closer to 3% (because both human traders and LLM-assisted agents are overestimating it), the expected profit on a "No" position is:

```
Expected_profit = (market_price - true_probability) × position_size
Expected_profit = (0.08 - 0.03) × $1000 = $50 per contract cycle
```

That's a 5-cent edge on a 92-cent position, which translates to roughly 5.4% expected return per resolution. On a market with weekly resolution, that compounds to substantial annual returns — assuming you can identify which tail events are overpriced.

The theoretical sweet spot based on bias analysis is events priced between 5-15% on prediction markets where rigorous base-rate analysis suggests the true probability is 2-5%. This zone combines two advantages: (1) the favorite-longshot bias is strongest here, and (2) the "No" position is cheap relative to the expected payout.

Here's a realistic example. Suppose a Polymarket contract asks: "Will [specific geopolitical event] happen by [date]?" The market price is $0.12. You run the event through a calibration-corrected pipeline:

- Raw LLM estimate: 14% (consistent with market)
- Historical base rate for similar events: 4%
- Calibration-corrected estimate: 6% (adjusting the LLM's known upward bias on low-probability events)
- Edge: 12% - 6% = 6 cents
- Position: Sell "Yes" / Buy "No" at $0.88

> The highest-edge opportunities in prediction markets are not in the 40-60% range where most volume concentrates. They're in the tails — the 5-15% and 85-95% zones — where both human and AI miscalibration is largest.

The problem, of course, is that tail events are tail events. You need a large enough portfolio of these positions to realize the statistical edge. One single low-probability event that actually happens will wipe out many successful "No" positions. Which brings us to the practical question: how do you actually build a system that exploits this?

## Phase 4: Practical Implications for Trading Agents

Knowing that LLMs are miscalibrated is useful. Building a trading system that profits from it requires solving four hard problems: confidence estimation, position sizing, conflict detection, and temporal decay.

A **multi-gate risk framework** requires every trade candidate to pass through a series of filters before execution — a series of filters, each eliminating bad trades that would look good to a naive system.

**Gate 1: Calibration-Adjusted Confidence**

Don't use the raw LLM probability. Apply a calibration correction first (more on how in Phase 5). Only consider trades where the corrected probability diverges from the market price by more than a minimum edge threshold. A reasonable floor is 4% — anything less gets eaten by fees, slippage, and model uncertainty.

**Gate 2: Kelly Criterion Position Sizing**

The Kelly criterion gives the optimal bet size to maximize long-run growth:

```
f* = (p * b - q) / b
```

Where `p` is the estimated probability of winning, `b` is the net odds (payout / stake - 1), and `q = 1 - p`. Full Kelly is theoretically optimal but practically suicidal — the variance will destroy your portfolio before the edge materializes. Use **fractional Kelly** (0.25 to 0.5 of the Kelly-recommended size) for any real deployment.

Example: If your calibration-corrected probability of winning a "No" position is 94% (corrected from the market's implied 88%), and the payout odds are roughly 1:7.3 (you risk $0.88 to make $0.12):

```
b = 0.12 / 0.88 = 0.136
p = 0.94, q = 0.06
f* = (0.94 * 0.136 - 0.06) / 0.136 = (0.1278 - 0.06) / 0.136 = 0.498
```

Full Kelly says bet 49.8% of your bankroll. That's insane for a single position. Quarter-Kelly says 12.5%. That's aggressive but survivable.

**Gate 3: Conflict Detection**

Does the LLM's estimate conflict with other information sources? The checks include: (1) base rates from historical data, (2) current news sentiment, (3) expert forecaster consensus where available, and (4) the model's own uncertainty when prompted multiple times. If any two sources disagree by more than 15 percentage points, the trade gets flagged for review or skipped.

**The Half-Life Problem**

Bailey et al. (2015) demonstrated that standard train/test splits in financial backtesting overestimate out-of-sample performance by 30-60%. Financial data is non-stationary, and temporal autocorrelation means your "test set" is more similar to your "train set" than you think. Walk-forward backtesting — re-training on a rolling window — is non-optional.

Beyond backtesting methodology, there's the alpha decay problem. In liquid prediction markets, news-driven price dislocations correct within 2-4 hours. Your agent needs to identify the miscalibration, verify it through the gate system, size the position, and execute — all before the market self-corrects. This is where execution infrastructure matters enormously.

Here's the multi-gate pipeline in pseudocode:

```python
def evaluate_trade(event, market_price):
    # Step 1: Get raw LLM probability
    raw_prob = llm.estimate_probability(event)

    # Step 2: Apply calibration correction
    corrected_prob = calibrator.transform(raw_prob)

    # Step 3: Gate 1 — Minimum edge threshold
    edge = abs(corrected_prob - market_price)
    if edge < MIN_EDGE_THRESHOLD:  # e.g., 0.04
        return None  # No trade

    # Step 4: Gate 2 — Kelly position sizing
    direction = "YES" if corrected_prob > market_price else "NO"
    win_prob = corrected_prob if direction == "YES" else (1 - corrected_prob)
    odds = market_price / (1 - market_price) if direction == "YES" \
           else (1 - market_price) / market_price
    kelly_fraction = (win_prob * odds - (1 - win_prob)) / odds
    position_size = bankroll * kelly_fraction * KELLY_SCALE  # 0.25-0.5

    # Step 5: Gate 3 — Conflict detection
    base_rate = get_historical_base_rate(event)
    news_sentiment = get_news_probability(event)
    sources = [corrected_prob, base_rate, news_sentiment]
    max_disagreement = max(sources) - min(sources)
    if max_disagreement > CONFLICT_THRESHOLD:  # e.g., 0.15
        return flag_for_review(event)

    # Step 6: Risk limits
    if position_size > MAX_POSITION:
        position_size = MAX_POSITION
    if portfolio.correlation(event) > MAX_CORRELATION:
        return None
    if portfolio.drawdown() > MAX_DRAWDOWN:
        return None

    return Trade(direction, position_size, corrected_prob, edge)
```

**Position sizing with calibration error adjustment**: The Kelly formula assumes your probability estimate is correct. It isn't. To account for calibration error, I reduce the effective edge by the model's ECE before computing the Kelly fraction:

```
adjusted_edge = max(0, edge - model_ECE)
```

If your model has an ECE of 0.08 and the raw edge is 0.06, the adjusted edge is negative — no trade. This adjustment filters out a significant portion of marginal trades, improving risk-adjusted returns by removing positions where the edge is likely illusory.

## Phase 5: Building a Calibrated Trading Pipeline

Here is the full pipeline, end to end — a system architecture that combines calibration correction with disciplined risk management.

**Step 1: Estimate probability using the LLM.**

Feed the event description, relevant context, and a structured prompt that asks for a specific probability estimate. Important: ask the model to reason through its estimate step-by-step before giving the final number. Chain-of-thought prompting has been shown to improve calibration by 2-4 ECE points on forecasting tasks. Also ask the model for its uncertainty range — a 60% estimate with "could be 40-80%" is very different from a 60% estimate with "could be 55-65%."

**Step 2: Apply calibration correction.**

Two methods work well here. **Platt scaling** fits a logistic regression to map raw model outputs to calibrated probabilities. You need a held-out calibration dataset of resolved predictions with known outcomes. The logistic function is:

```
calibrated_prob = 1 / (1 + exp(A * raw_prob + B))
```

Where A and B are fit on the calibration dataset. This works well when the miscalibration is roughly monotonic (which it usually is for LLMs).

**Isotonic regression** is more flexible — it fits a non-parametric, non-decreasing function to the calibration data. It handles non-monotonic distortions better but requires more calibration data to avoid overfitting. In general, Platt scaling is sufficient for most use cases and more stable with limited data.

**Step 3: Compare corrected probability to market price.**

This is where you identify edge. The corrected probability is your best estimate of the true probability. The market price is the crowd's estimate. The difference is your potential edge. But remember: the market includes informed traders, insiders, and other models. Treat any edge above 4% with respect but not certainty.

**Step 4: Size position with Kelly criterion.**

Use fractional Kelly (0.25-0.5) applied to the calibration-adjusted edge. For a portfolio of prediction market positions, a reasonable guideline is a maximum of 5% of bankroll per position and a maximum of 30% deployed across correlated positions.

**Step 5: Risk gates before execution.**

Final checks before the trade goes live:

- Maximum position size: no single position > 5% of bankroll
- Portfolio correlation: new position must not push correlated exposure above 30%
- Drawdown circuit breaker: if portfolio is down more than 15% from peak, reduce all new position sizes by 50%
- Liquidity check: is there enough depth in the order book to execute without moving the price more than 1%?

Here's the full pipeline in pseudocode:

```python
class CalibratedTradingPipeline:
    def __init__(self, llm, calibrator, risk_manager):
        self.llm = llm
        self.calibrator = calibrator  # Platt scaling or isotonic regression
        self.risk_manager = risk_manager
        self.trade_log = []  # For feedback loop

    def run(self, event, market_price):
        # Step 1: Raw estimate with chain-of-thought
        raw_estimate = self.llm.forecast(
            event=event,
            prompt="Reason step-by-step, then give a probability 0-100%"
        )

        # Step 2: Calibration correction
        corrected = self.calibrator.transform(raw_estimate.probability)

        # Step 3: Edge calculation
        edge = corrected - market_price  # Positive = YES edge, Negative = NO edge
        if abs(edge) < 0.04:
            return NoTrade(reason="Insufficient edge")

        # Step 4: Position sizing (fractional Kelly)
        direction = "YES" if edge > 0 else "NO"
        kelly_size = self.compute_kelly(
            win_prob=corrected if direction == "YES" else 1 - corrected,
            odds=self.compute_odds(market_price, direction),
            fraction=0.25  # Quarter-Kelly for safety
        )

        # Step 5: Risk gates
        trade = Trade(event, direction, kelly_size, corrected, edge)
        if not self.risk_manager.approve(trade):
            return NoTrade(reason=self.risk_manager.rejection_reason)

        # Execute via D0
        result = d0.execute(trade)

        # Feedback loop: log for recalibration
        self.trade_log.append({
            "event": event,
            "raw_estimate": raw_estimate.probability,
            "corrected": corrected,
            "market_price": market_price,
            "direction": direction,
            "size": kelly_size,
            "outcome": None  # Filled on resolution
        })

        return result

    def recalibrate(self):
        """Re-fit calibrator on resolved trades"""
        resolved = [t for t in self.trade_log if t["outcome"] is not None]
        if len(resolved) > 50:  # Minimum sample size
            self.calibrator.fit(
                X=[t["raw_estimate"] for t in resolved],
                y=[t["outcome"] for t in resolved]
            )
```

**Why execution infrastructure matters here.** The gap between "I've identified an edge" and "I've captured that edge on-chain" is where most theoretical alpha dies. D0's execution layer compresses that gap to near-zero — the agent calls `d0 trade polymarket --market [id] --side NO --size [amount]` and the position is live. No GUI. No copy-pasting addresses. No manual approval flow.

**The feedback loop is the real moat.** Every resolved trade provides a data point for recalibrating the correction function. After 200-300 resolved predictions, the system's effective ECE drops below 0.03 — you become one of the most calibrated participants in the market, and every mispriced contract is visible to you.

Walk-forward recalibration is critical. Markets evolve, LLM behavior changes with updates, and the distribution of prediction market questions shifts over time. A practical cadence is recalibrating Platt scaling parameters every 100 resolved predictions using only the most recent 500 data points — current without overfitting to stale data.

## Conclusion: The Calibration Edge Is Real, and It's Compounding

Here's the bottom line.

LLMs are not bad at estimating probabilities. They're predictably biased in specific, measurable ways — overestimating low-probability events, underestimating high-probability events, and compressing the full distribution toward the center. This bias is inherited from human training data and reinforced by RLHF optimization that penalizes confident errors.

This creates a structural edge in prediction markets, particularly in the tails (5-15% and 85-95% ranges), where the favorite-longshot bias is strongest. Both human traders and LLM-assisted agents share this bias, meaning market prices at the extremes are systematically wrong.

Capturing this edge requires four things:

1. **A calibration correction layer** (Platt scaling or isotonic regression) that transforms raw LLM outputs into properly calibrated probabilities
2. **A multi-gate risk framework** that prevents you from trading on noise, including conflict detection and calibration-adjusted edge thresholds
3. **Disciplined position sizing** via fractional Kelly criterion, adjusted for calibration error
4. **Fast execution infrastructure** that compresses the time from signal to on-chain position, because alpha decays in hours, not days

> The future of prediction market trading is not human vs. AI. It's calibrated AI vs. miscalibrated AI. The models that know how wrong they are — and correct for it — will systematically extract value from the models that don't.

The compounding effect is what makes this genuinely exciting. Every resolved trade improves your calibration correction. Every improvement expands the set of edges you can identify. And as more participants enter prediction markets with uncorrected LLM estimates, the pool of miscalibrated liquidity grows.

We're building this pipeline into D0's agent framework because the feedback loop between execution and calibration is the right architecture. The agent that trades, measures, corrects, and trades again will converge on true calibration faster than any offline research process.

The question isn't whether AI can price risk. It's whether AI can learn to price risk better than the market — and the empirical evidence says yes, if you build the correction layer. Start with the calibration curve. Everything else follows from there.
