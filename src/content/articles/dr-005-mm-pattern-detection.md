---
title: "DR-005: On-Chain Behavioral Fingerprinting — Detecting Market Maker Patterns"
subtitle: "Market makers leave identifiable traces on-chain. AI can learn to read them. Here's how behavioral fingerprinting works — and why it's an arms race."
date: "2026-03-07"
author: "Donut Research"
category: "RESEARCH"
tags: ["On-Chain Analytics", "Pattern Recognition", "Market Makers", "Anomaly Detection"]
description: "A technical analysis of how market maker behavior can be detected through on-chain data patterns, covering C-type and E-type manipulation signatures, detection methodology, and the adversarial dynamics of MM detection systems."
---

Every market maker has a fingerprint. Not a deliberate one — nobody chooses to leave identifiable patterns. But the operational constraints of market making — inventory management, risk limits, profit targets, execution infrastructure — impose structural regularities on trading behavior that are as distinctive as a signature.

On a transparent blockchain, these fingerprints are permanently visible. Every order, every cancel, every fill, every timing pattern is recorded in an immutable ledger that anyone can analyze. The question isn't whether market maker patterns exist on-chain. The question is whether they can be detected reliably enough to be useful — and whether the detection itself changes the game.

This is the core research question behind DR-005: can AI systems identify market maker behavioral patterns from on-chain data in real time, and what are the practical implications for traders operating in these markets?

## Phase 1: What Market Makers Actually Do On-Chain

Before we can detect market maker patterns, we need to understand what market makers actually do — at the operational level, not the textbook level.

A market maker's job is to provide liquidity: placing both buy and sell orders on an order book (or providing liquidity to an AMM pool) and profiting from the bid-ask spread. The textbook version is clean. The on-chain reality is messy.

In crypto markets — particularly on CEX-DEX hybrid venues and on fully on-chain order books — market makers face constraints that create distinctive behavioral patterns:

**Inventory risk.** A market maker that accumulates too much of one asset is exposed to directional price risk. When inventory builds on one side, the MM must either widen spreads (reducing competitiveness) or actively trade to rebalance (creating detectable flow patterns). The rebalancing trades have a characteristic signature: they're larger than normal MM orders, they cluster in time, and they often move across venues.

**Latency management.** On-chain execution has inherent latency — block times, mempool delays, gas price competition. MMs that need to cancel stale quotes before a price move do so in predictable patterns: mass cancellations followed by requoting at new price levels. The timing between cancel-and-requote is a fingerprint.

**Profit extraction.** MMs need to realize profits, which means periodically converting accumulated spread income into stablecoins or fiat. These withdrawal patterns — regular, periodic, to consistent destination addresses — are among the easiest MM behaviors to detect.

**Information advantage.** Some market makers have access to order flow information before it hits the public order book (through internalization, private feeds, or colocation). Trades that consistently appear just before significant price moves suggest informed flow — whether that constitutes legitimate market making or front-running is a regulatory question, but the behavioral pattern is the same.

## Phase 2: The Two Canonical Manipulation Patterns

Through analysis of on-chain trading data, two recurring market maker manipulation patterns have been identified and categorized. These are not exhaustive — the taxonomy is evolving — but they represent the most common and most detectable archetypes.

### C-Type: Staircase Pump (阶梯拉盘)

The C-type pattern is a controlled price escalation where the market maker systematically moves the price upward through a series of discrete steps, each step consisting of:

1. **Accumulation at a price level.** The MM places buy orders at or slightly above the current price, absorbing all available sell-side liquidity at that level.
2. **Liquidity withdrawal above.** The MM cancels or reduces its sell orders at the next price level up, creating a gap.
3. **Step-up.** With buy pressure exceeding sell supply, the price moves up to the next level.
4. **Stabilization.** The MM places both buy and sell orders at the new level, creating the appearance of genuine two-sided liquidity.
5. **Repeat.** The cycle continues, moving the price up in a characteristic staircase pattern.

The on-chain fingerprint of a C-type manipulation includes:

- **Uniform step sizes.** The price increases are suspiciously regular — not the organic, noisy movements of genuine supply-demand dynamics. Each step is roughly the same size, reflecting the MM's programmatic execution.
- **Volume clustering at step transitions.** Trading volume spikes at each step-up as the MM's buy orders absorb sell liquidity, then drops during stabilization periods.
- **Order book asymmetry.** During the pump, the bid side (buy orders) is consistently deeper than the ask side (sell orders) around the current price. This asymmetry is the opposite of what you'd see in a genuine bull market, where rising prices attract new sellers.
- **Wallet concentration.** The buying pressure comes from a small number of related wallets (often identifiable through shared funding sources or creation timestamps).

```
C-Type Signature Detection Features:
- price_step_regularity: std_dev(step_sizes) / mean(step_sizes) < 0.3
- volume_spike_at_steps: volume_at_transition / baseline_volume > 3.0
- order_book_asymmetry: bid_depth / ask_depth > 2.0 during pump
- wallet_concentration: top_5_wallets_share > 0.6 of buy volume
```

### E-Type: Cover Distribution (掩护出货)

The E-type pattern is the inverse: a controlled sell-off disguised as organic trading activity. The MM needs to exit a large position without crashing the price, so it creates the illusion of bullish activity while systematically distributing inventory.

The sequence:

1. **Headline buying.** The MM executes visible, above-market buy orders — large enough to appear on order flow trackers and social media. These create the narrative of "whale accumulation."
2. **Hidden selling.** Simultaneously, the MM sells larger quantities through fragmented orders — smaller sizes, different wallets, spread across multiple time windows. The net flow is selling, but the visible flow appears to be buying.
3. **Sentiment management.** The visible buys may coincide with social media activity, influencer mentions, or news events that provide cover for the distribution.
4. **Gradual price decline.** Despite the apparent buying pressure, the price slowly drifts downward as the hidden selling outweighs the visible buying. By the time the distribution is complete, the price is significantly lower, and the MM has exited its position.

The on-chain fingerprint of E-type manipulation:

- **Size mismatch.** Visible buy orders are large and infrequent. Sell orders are small, numerous, and spread across multiple wallets. The total sell volume exceeds total buy volume, but the average sell order is much smaller than the average buy order.
- **Wallet proliferation.** Selling activity comes from many wallets, often newly created, with funding traces leading back to a common source. Buy activity comes from established, identifiable wallets.
- **Time distribution.** Buys cluster during high-attention periods (US market hours, after news events). Sells are distributed more evenly across time, including low-attention periods.
- **Price divergence.** Despite visible buying, the price fails to sustain upward momentum. Each rally gets sold into, creating a pattern of lower highs.

```
E-Type Signature Detection Features:
- buy_sell_size_ratio: mean(buy_size) / mean(sell_size) > 5.0
- sell_wallet_count: unique_sell_wallets / unique_buy_wallets > 3.0
- net_flow_direction: total_sell_volume / total_buy_volume > 1.2
- time_dispersion: sell_time_entropy / buy_time_entropy > 1.5
```

## Phase 3: Detection Methodology — From Behavioral Fingerprinting Research

The methodological foundation for on-chain behavioral detection comes from Cong et al.'s research on crypto wash trading ("Crypto Wash Trading," NBER Working Paper 30783, 2023). Their approach — behavioral fingerprinting of on-chain activity — found that 70-80% of volume on unregulated crypto exchanges was artificial, identified through statistical signatures that distinguish genuine trading from manufactured activity.

Their methodology uses three detection layers:

**Layer 1: Statistical anomaly detection.** Genuine trading activity follows well-documented statistical distributions (power-law order sizes, Poisson-like arrival times, mean-reverting spreads). Manipulative activity deviates from these distributions in measurable ways. The key metrics:

- **Order-to-trade ratio.** Legitimate market makers have O/T ratios of 5-20x. Manipulative activity often shows ratios above 50x (massive order placement with minimal fills, indicating quote stuffing or spoofing).
- **Cancel rate.** Legitimate MMs cancel 60-80% of orders (normal for high-frequency market making). Manipulation patterns show cancel rates above 95%, particularly for orders placed far from the current price.
- **Fill asymmetry.** Legitimate MMs get filled roughly equally on both sides (within inventory management tolerances). Manipulation shows systematic asymmetry — fills are concentrated on one side while the other side is used for display only.

**Layer 2: Network analysis.** On-chain transactions form a graph. Related wallets — controlled by the same entity — can be identified through:

- **Shared funding sources.** Wallets that received initial funding from the same address or through the same mixing pattern.
- **Temporal correlation.** Wallets that are consistently active during the same time windows and inactive during the same periods.
- **Cross-wallet patterns.** Token flows between wallets that follow a characteristic hub-and-spoke pattern (distribution from a central wallet, with occasional consolidation back).

**Layer 3: Behavioral clustering.** Using unsupervised machine learning (clustering algorithms like DBSCAN or HDBSCAN), wallets can be grouped by behavioral similarity across multiple features simultaneously. Clusters that show unusual coherence — many wallets behaving almost identically — are flagged as potentially coordinated.

The Dune Analytics community dashboards and Chaos Labs reports have applied variants of this methodology to Polymarket, quantifying bot market share and identifying wash trading patterns. Their analysis provides a real-time substrate for monitoring agent and MM activity at the protocol level.

## Phase 4: Real-Time vs. Post-Hoc Detection

The practical challenge isn't whether MM patterns can be detected — the research is clear that they can. The challenge is **when** they can be detected.

Post-hoc detection (analyzing completed manipulation after the fact) is relatively straightforward. With full transaction history, the statistical signatures are clear. Academic papers routinely achieve high classification accuracy on historical data.

Real-time detection is fundamentally harder because of the **latency-accuracy tradeoff**:

**More data = better accuracy but more delay.** A C-type staircase pattern becomes obvious after 5-6 steps. After 2 steps, it's indistinguishable from genuine price discovery. Waiting for more data improves detection confidence but reduces the time available to act on the detection.

**Streaming statistics have higher false-positive rates.** With limited data in a rolling window, the statistical tests that distinguish manipulation from organic activity have wider confidence intervals. A genuine rally can look like a C-type pump in its early stages. A legitimate large seller can look like E-type distribution before the full pattern develops.

**Adversarial adaptation increases false negatives.** Sophisticated MMs monitor for detection systems and adapt their behavior to stay below detection thresholds. Adding noise to step sizes, varying wallet counts, randomizing timing — all reduce the signal-to-noise ratio that detection systems rely on.

The practical resolution is a **tiered alert system**:

```
Tier 1 (Low confidence, <30 sec latency):
  - Rapid statistical checks on real-time order flow
  - High false-positive rate (~40-60%)
  - Action: flag for monitoring, no trade decisions

Tier 2 (Medium confidence, 2-5 min latency):
  - Pattern matching against known manipulation templates
  - Moderate false-positive rate (~15-25%)
  - Action: adjust risk parameters, tighten stop-losses

Tier 3 (High confidence, 15-60 min latency):
  - Full behavioral fingerprinting with network analysis
  - Low false-positive rate (~5-10%)
  - Action: trade signals, position adjustments, alerts
```

This tiered approach is consistent with the current state of open problem P5 from the AI Trade frontier: no production system exists yet for automated real-time detection on prediction markets. The technical infrastructure exists — on-chain data is available, the algorithms are well-understood — but the engineering challenge of reducing latency while maintaining accuracy is unsolved at production scale.

## Phase 5: Case Studies from the Frontier

Two events from recent prediction market history illustrate both the potential and the limitations of behavioral detection:

**Case 1: The GTA VI Event.**

When a prediction market contract on a GTA VI announcement showed unusual pre-event trading activity, post-hoc analysis revealed a detectable insider pattern. Specific wallets accumulated large positions in the 12-24 hours before the announcement, in a pattern inconsistent with organic trading:

- Position sizes were unusually large relative to the wallets' history
- Entry timing clustered in a narrow window
- No corresponding social media or news activity explained the positioning
- The wallets had no prior history of trading in the gaming/entertainment category

The pattern was clearly visible in retrospect. Whether it could have been detected in real time is less clear — the signal-to-noise ratio was high (the positions were large relative to market volume) but the time window was short.

**Case 2: Suspicious Pre-Announcement Trading.**

The Pete Hegseth ban event on Polymarket showed a different pattern — suspicious trading activity in the 2-6 hours before the public announcement. The behavioral signature included:

- Sudden increase in "Yes" position accumulation from previously inactive wallets
- Order sizes that suggested coordinated rather than independent activity
- Timing correlation between multiple wallets that exceeded random chance

In this case, the price adjustment happened faster — the market moved within approximately 2 hours of the first suspicious trades, consistent with hypothesis H2's estimate that news-driven alpha has a half-life of under 4 hours in liquid prediction markets.

Both cases demonstrate that behavioral fingerprinting can identify suspicious activity. The open question is whether detection can be fast enough to be actionable — not just for post-hoc investigation, but for real-time risk management.

## Phase 6: Feature Engineering for Production MM Detection

Building a production detection system requires engineering features that capture the behavioral signatures described above while remaining robust to adversarial adaptation. The key feature categories:

**1. Order flow features:**

```
- order_to_trade_ratio: orders_placed / orders_filled
- cancel_rate: orders_cancelled / orders_placed
- fill_asymmetry: abs(buy_fills - sell_fills) / total_fills
- spread_contribution: time_at_bbo / total_time  (time at best bid/offer)
- quote_lifetime: median(time_between_place_and_cancel)
```

**2. Wallet behavior features:**

```
- wallet_age: time_since_first_transaction
- activity_entropy: entropy(hourly_transaction_counts)
- position_concentration: max_position / total_portfolio
- funding_source_diversity: unique_funding_sources / total_deposits
- withdrawal_regularity: autocorrelation(withdrawal_timestamps)
```

**3. Cross-wallet correlation features:**

```
- temporal_correlation: pearson(wallet_A_activity, wallet_B_activity)
- size_similarity: 1 - abs(mean_order_A - mean_order_B) / max(mean_A, mean_B)
- directional_alignment: fraction(same_side_trades) across wallet pairs
- funding_graph_distance: shortest_path(wallet_A, wallet_B) in tx graph
```

**4. Market impact features:**

```
- information_toxicity: price_move_after_fill / spread
- permanent_impact: price_5min_after / price_at_fill - 1
- realized_spread: 2 × side × (price_at_fill - midpoint_5min_later)
```

Information toxicity — how much prices move against the market maker after a fill — is particularly diagnostic. Legitimate MMs experience moderate toxicity (they occasionally get picked off by informed traders). Manipulative MMs show abnormally low toxicity on their "display" orders (because they're not genuine quotes) and abnormally high toxicity on their real trades (because they're trading with private information).

## Phase 7: The Adversarial Arms Race

Here's the uncomfortable truth about MM detection: any detection system that becomes public knowledge gets adapted around.

The moment MMs know that step-size regularity is a detection feature, they add noise to their step sizes. When they know that wallet concentration is tracked, they distribute activity across more wallets. When they know that temporal correlation is monitored, they introduce random delays.

This creates a classic arms race dynamic:

**Round 1:** Detection system identifies C-type patterns via step regularity.
**Round 2:** MMs add Gaussian noise to step sizes. Detection accuracy drops.
**Round 3:** Detection system adds higher-order features (step acceleration, volume shape, order book dynamics). Accuracy recovers.
**Round 4:** MMs introduce more complex adaptation. Cycle continues.

The equilibrium of this arms race depends on the relative cost of detection vs. evasion. Detection systems have an inherent advantage: they can observe all on-chain data simultaneously and apply statistical tests across the full dataset. Evasion requires maintaining the manipulation's effectiveness while adding enough noise to defeat detection — and adding noise reduces the manipulation's profitability.

This asymmetry suggests that detection systems can stay ahead of evasion, but only if they continuously evolve. A static detection system will be defeated within weeks of deployment. A system that continuously retrains on new evasion patterns — a living adversarial model — can maintain effectiveness indefinitely.

The practical recommendation: never deploy a fixed rule-based detection system. Deploy a framework that combines rule-based heuristics (for known patterns) with anomaly detection (for novel patterns) and continuously retrains on classified examples. The rules catch known attacks; the anomaly detection catches new ones.

> The goal of behavioral fingerprinting isn't perfect detection — it's asymmetric cost. Make manipulation more expensive than legitimate market making, and the incentive structure shifts. MMs that play fair pay less compliance cost than MMs that manipulate. Over time, the legitimate operators survive and the manipulators find it unprofitable.

## Conclusion: Detection as Infrastructure

On-chain behavioral fingerprinting is not a solved problem — it's an infrastructure challenge. The data is available. The statistical methods are proven. The case studies demonstrate feasibility. What's missing is the production engineering: systems that operate at blockchain speed, maintain accuracy under adversarial pressure, and integrate seamlessly with trading agents' risk frameworks.

For the D0 ecosystem, MM detection is a natural extension of the multi-gate risk framework. Before executing a trade, an agent should check not just its own confidence, position size, and conflict detection — but also whether the market it's about to trade in shows signs of active manipulation. A C-type pump in progress means the agent is buying into artificial demand. An E-type distribution means the agent is providing exit liquidity to a selling manipulator.

Integrating detection into the execution pipeline transforms it from a forensic tool (useful for post-hoc analysis) into a risk management tool (useful for avoiding bad trades in real time). That's where this research is heading — and it's why real-time detection, despite being technically harder than post-hoc analysis, is the problem worth solving.

The behavioral fingerprints are there. The challenge is reading them fast enough to matter.
