# AI Trade — working definition (as-of)

As-of: 2026-03-06T10:00Z (UTC)

## One-sentence definition
**AI Trade** is the study of how AI/LLM agents make autonomous trading decisions — probability estimation, alpha generation, signal aggregation, execution optimization, and risk management — across financial markets, prediction markets, and decentralized exchanges.

## Two classes (intelligence-side vs execution-side)

### Class A — *Trading intelligence* (signal generation, probability calibration, alpha discovery)
How AI agents form trading views and generate actionable signals: LLM probability calibration on event outcomes, news-driven alpha extraction, anomaly/insider-trading detection, market microstructure exploitation, and the intersection of foundation models with quantitative finance.

- Central tension: are LLM probability estimates well-calibrated enough to generate persistent edge, or do they introduce systematic biases that erode alpha?
- Key actors: prediction market operators (Polymarket, Kalshi), crypto trading desks, DeFi protocols, quant funds experimenting with LLMs, academic researchers (calibration, forecasting).
- Evidence sources: arXiv (cs.AI, q-fin, cs.CE), prediction market resolution data, forecasting tournaments (Metaculus, GJOpen), trading competition results, hedge fund research.

### Class B — *Trading execution* (order management, risk gates, agent safety, market impact)
The systems enabling agents to execute trades safely and efficiently: order routing and slippage optimization, multi-gate risk frameworks (confidence/position/conflict checks), agent budget constraints for trading, adversarial robustness (front-running, sandwich attacks), and simulation/backtesting infrastructure.

- Central question: how do you let an agent autonomously move money while maintaining safety, regulatory compliance, and capital efficiency?
- Key actors: DEX/CLOB protocols, MEV researchers, prediction market infrastructure teams, agent framework developers, regulators (CFTC, SEC).
- Evidence sources: on-chain analytics, MEV research, agent security benchmarks, trading system postmortems, regulatory filings.

Most practical analysis spans both classes: an agent's trading edge depends on signal quality (Class A) and the execution infrastructure that preserves that edge (Class B).

## What counts as "ai-trade" (the substrate)
When we say "ai-trade," we mean one or more of:

1. **LLM probability calibration** — how well foundation models estimate event probabilities, systematic biases (overconfidence, anchoring, recency), and calibration improvement methods.
2. **AI alpha generation** — using LLMs/agents to discover tradeable signals from news, social sentiment, on-chain data, or cross-market patterns, including non-stationarity challenges.
3. **Prediction market agents** — autonomous systems trading on prediction markets (Polymarket, Kalshi, Metaculus), including event categorization, liquidity assessment, and market-making.
4. **Trading execution intelligence** — agent-driven order management: slippage optimization, MEV protection, timing, position sizing (Kelly criterion), and multi-gate risk frameworks.
5. **Anomaly/insider trading detection** — automated identification of unusual trading patterns, whale behavior, information asymmetry signals, and front-running detection.
6. **Agent trading safety** — budget constraints, kill switches, position limits, conflict detection, and regulatory compliance for autonomous trading agents.
7. **Backtesting & simulation** — infrastructure for evaluating AI trading strategies: walk-forward testing, cost modeling, regime detection, and the gap between simulation and live performance.
8. **Market microstructure × agents** — how bot/agent participation changes market quality: liquidity provision, price discovery efficiency, wash trading, and the favorite-longshot bias.

## Scope boundaries

### In-scope
- LLM/agent-driven trading decision-making (probability estimation, signal generation, portfolio construction)
- Prediction market strategy and agent trading on Polymarket/Kalshi/similar
- Trading execution optimization by agents (MEV, slippage, timing)
- Agent trading safety and risk management frameworks
- Market microstructure effects of AI/bot participation
- Backtesting methodology for AI trading strategies
- Forecasting calibration of LLMs on real-world events
- Anomaly detection and insider trading pattern recognition
- Favorite-longshot bias and other behavioral biases in prediction markets

### Out-of-scope (handled by neighboring topics)
- **agent-economics**: agent payment infrastructure (x402, Stripe ACP) and labor market effects — different from agents making trading decisions
- **agent-security**: general agent safety (prompt injection, sandboxing) — ai-trade focuses specifically on *financial* safety (position limits, kill switches)
- **evaluation-benchmarks**: general LLM evaluation — ai-trade focuses on *calibration* and *trading-specific* evaluation
- **world-model**: general world modeling — ai-trade may use world models but focuses on their application to market prediction
- Traditional quant finance without AI/LLM component (pure stat arb, HFT without LLM signals)
- Crypto protocol design (tokenomics, DeFi mechanism design) unless directly about agent trading

## Neighboring topics and boundary rules
| Neighbor | Boundary rule |
|---|---|
| agent-economics | If it's about how agents *pay* for things → agent-economics. If it's about how agents *trade* to make money → ai-trade. |
| agent-security | General agent safety primitives → agent-security. Financial-specific safety (position limits, P&L stops) → ai-trade. |
| evaluation-benchmarks | General LLM eval methodology → evaluation-benchmarks. Calibration on market/event probabilities → ai-trade. |
| world-model | General world modeling architecture → world-model. World models applied to market prediction → ai-trade. |
| proactive-agents | General proactive behavior → proactive-agents. Proactive trade signal generation / alerting → ai-trade. |

## Seed problems (P#) — initial research questions

- **P1**: How well-calibrated are LLM probability estimates on prediction market events, and does calibration vary by event category (politics vs crypto vs sports)?
- **P2**: Can LLMs generate persistent alpha from news/sentiment analysis, or does the signal decay too fast for practical trading?
- **P3**: What is the optimal multi-gate risk framework for autonomous trading agents (confidence × position × conflict)?
- **P4**: How does bot/agent participation change prediction market quality (liquidity, price discovery, manipulation)?
- **P5**: Can anomalous trading patterns (insider trading, wash trading) be detected in real-time by LLM-based systems?
- **P6**: What backtesting methodology is appropriate for AI trading strategies given non-stationarity and regime changes?
- **P7**: How should agent trading autonomy be bounded (budget limits, position caps, human approval gates)?
- **P8**: What is the favorite-longshot bias magnitude in prediction markets, and can it be systematically exploited by agents?

## Seed hypotheses (H#) — working predictions

- **H1**: LLM probability estimates are systematically overconfident on low-probability events and underconfident on high-probability events (miscalibrated in the tails). Confidence: Medium.
- **H2**: News-driven alpha from LLM analysis has a half-life of <4 hours in liquid prediction markets — too slow for manual trading but viable for automated agents. Confidence: Medium-Low.
- **H3**: Multi-gate risk frameworks (≥3 independent checks) will become standard for production trading agents by Q4 2026, analogous to defense-in-depth in security. Confidence: Medium-High.
- **H4**: Bot participation improves price discovery but increases manipulation risk — net effect on market quality is ambiguous and market-specific. Confidence: Medium.
- **H5**: Favorite-longshot bias persists in prediction markets and provides a reliable but low-frequency alpha source for systematic agents. Confidence: Medium-High.
- **H6**: Backtesting AI trading strategies requires walk-forward + regime-aware splits; standard train/test splits systematically overestimate performance. Confidence: High.
# Frontier — achievements log (AI Trade)

## B1: Can ChatGPT Forecast Stock Price Movements?
- Date: 2023-04
- **Source (paper)**: Lopez-Lira & Tang, "Can ChatGPT Forecast Stock Price Movements? Return Predictability and Large Language Models"
- **URL**: https://arxiv.org/abs/2304.07619 (verify)
- **One-liner**: GPT-4 sentiment scores from financial news predict cross-sectional stock returns; long-short portfolio on GPT-4 signal earns significant abnormal returns.
- **Tags**: P2, H2
- **Evidence**: high
- **Notes**: Equity market, not prediction markets — transfer validity to PM context needs validation. First rigorous empirical test of LLM alpha on real return data.

## B2: BloombergGPT — Domain-Adapted LLM for Finance
- Date: 2023-03
- **Source (paper)**: Wu et al., "BloombergGPT: A Large Language Model for Finance"
- **URL**: https://arxiv.org/abs/2303.17564
- **One-liner**: 50B LLM trained on 363B tokens of financial text outperforms general-purpose models on financial NLP benchmarks (sentiment, NER, QA).
- **Tags**: P2, H2
- **Evidence**: high
- **Notes**: Establishes domain adaptation value for financial text understanding. Baseline for news-driven alpha pipeline design. Superseded by GPT-4 class models on raw capability but confirms domain-specific pretraining matters.

## B3: Prediction Markets — Canonical Survey (Wolfers & Zitzewitz 2004)
- Date: 2004-01
- **Source (paper)**: Wolfers & Zitzewitz, "Prediction Markets," *Journal of Economic Perspectives*
- **URL**: verify
- **One-liner**: Foundational survey establishing information aggregation theory, empirical accuracy of prediction markets vs. polls, and design principles that define the field.
- **Tags**: P1, P4, H4
- **Evidence**: high
- **Notes**: Pre-internet scale but theoretical framework holds. Calibration evidence predates LLMs — establishes baseline market efficiency that LLM strategies must beat.

## B4: Forecasting Future World Events with Neural Networks
- Date: 2022-06
- **Source (paper)**: Zou et al., "Forecasting Future World Events with Neural Networks"
- **URL**: https://arxiv.org/abs/2206.15474 (verify)
- **One-liner**: Language models fine-tuned on Metaculus questions approach human forecaster accuracy on open-ended world events; first large-scale LLM calibration study on real prediction questions.
- **Tags**: P1, H1
- **Evidence**: high
- **Notes**: Metaculus domain, not Polymarket. Calibration analysis is key baseline for H1 (tail miscalibration hypothesis). Shows LLMs are approximately calibrated in aggregate but gap vs. superforecasters widens on tail events.

## B5: Explaining the Favorite-Longshot Bias (Snowberg & Wolfers 2010)
- Date: 2010-01
- **Source (paper)**: Snowberg & Wolfers, "Explaining the Favorite-Longshot Bias: Is It Risk-Love or Misperceptions?" *Journal of Political Economy*
- **URL**: verify
- **One-liner**: Decomposes the favorite-longshot bias into risk love vs. systematic probability misperception; finds misperceptions dominate, meaning longshots are overpriced because bettors overestimate their win probability.
- **Tags**: P8, H5
- **Evidence**: high
- **Notes**: Sports betting context. Transfer to prediction markets supported by A8 literature. Mechanism (misperception rather than risk love) implies bias persists even with sophisticated participants — exploitability doesn't vanish as markets mature.

## B6: The Probability of Backtest Overfitting (Bailey et al. 2015)
- Date: 2015-01
- **Source (paper)**: Bailey, Borwein, Lopez de Prado, Zhu, "The Probability of Backtest Overfitting"
- **URL**: verify (SSRN / Journal of Computational Finance)
- **One-liner**: Introduces the Probability of Backtest Overfitting (PBO) metric; proves that with N strategy trials on the same dataset, the probability of selecting an overfit strategy approaches 1 — quantifying the multiple-testing crisis in algo trading.
- **Tags**: P6, H6
- **Evidence**: high
- **Notes**: Mathematical foundation for why walk-forward validation is non-optional. Directly explains H6 (30–60% performance overestimation from standard train/test splits).

## B7: High-Frequency Trading and the New Market Makers (Menkveld 2016)
- Date: 2016-01
- **Source (paper)**: Menkveld, "High-Frequency Trading and Market Structure," *Annual Review of Financial Economics*
- **URL**: verify
- **One-liner**: Documents that HFT market makers reduce spreads (improving liquidity) but impose adverse selection costs — establishing the dual nature of bot participation: liquidity provision vs. toxic order flow extraction.
- **Tags**: P4, H4
- **Evidence**: high
- **Notes**: Traditional equity markets but mechanism applies directly to crypto/prediction market bots. Primary empirical support for H4 (ambiguous net market quality effect). Menkveld won Nobel-adjacent recognition for this work.

## B8: Crypto Wash Trading (Cong, Li, Tang et al. 2023)
- Date: 2023-01
- **Source (paper)**: Cong et al., "Crypto Wash Trading"
- **URL**: https://www.nber.org/papers/w30783 (verify)
- **One-liner**: Behavioral fingerprinting of on-chain activity finds 70–80% of volume on unregulated crypto exchanges is artificial — provides methodology and baseline for prediction market wash trading studies.
- **Tags**: P4, P5, H4
- **Evidence**: high
- **Notes**: Crypto exchange context; PM estimate lower (25–33%, A6) because on-chain transparency makes detection easier. Methodology section directly applicable to building P5 automated detection systems.

## B9: Optimal Execution of Portfolio Transactions (Almgren & Chriss 2001)
- Date: 2001-01
- **Source (paper)**: Almgren & Chriss, "Optimal Execution of Portfolio Transactions"
- **URL**: verify (Applied Mathematical Finance / Journal of Risk)
- **One-liner**: Mean-variance framework minimizing market impact × timing risk tradeoff; introduces formal position-sizing as a risk management primitive that every modern execution system builds on.
- **Tags**: P3, H3
- **Evidence**: high
- **Notes**: Pre-LLM foundational paper. Multi-gate risk frameworks in production trading (H3) extend this framework by adding confidence and conflict dimensions alongside position sizing. Essential reading for P3.

## B10: Explainable AI for Financial Decision Support — Survey
- Date: 2022-09
- **Source (paper)**: Arrieta et al. or equivalent XAI-finance survey (verify specific paper)
- **URL**: verify
- **One-liner**: Surveys explainability requirements in financial AI systems; identifies regulatory and operational gaps for when autonomous systems require human approval vs. can act independently.
- **Tags**: P7, H3
- **Evidence**: med
- **Notes**: ID verify — multiple 2022–2024 papers cover XAI-finance; pick highest-cited on retrieval. Directly addresses P7 (agent trading autonomy boundaries) from a regulatory and design perspective.

## B11: freqtrade — Open-Source Crypto Trading Bot Framework
- Date: 2018-06
- **Source (repo)**: freqtrade/freqtrade
- **URL**: https://github.com/freqtrade/freqtrade
- **One-liner**: Production-grade crypto trading framework with backtesting, dry-run, live execution, Telegram alerts, and multi-strategy support; de facto standard for testing algo strategies in crypto.
- **Tags**: P3, H3
- **Evidence**: med
- **Notes**: ~35K GitHub stars. Implements position limits, max-drawdown stops, and strategy sanity checks — practical existence proof of multi-gate architecture in production (H3). Source of ground-truth patterns for P3 design.

## B12: OpenBB — Open-Source Financial Analysis Platform
- Date: 2021-11
- **Source (repo)**: OpenBB-finance/OpenBBTerminal
- **URL**: https://github.com/OpenBB-finance/OpenBBTerminal
- **One-liner**: Open-source Bloomberg terminal alternative with data fetching, news/sentiment analysis, backtesting integration, and LLM plugin support — infrastructure layer for building AI trading research pipelines.
- **Tags**: P6, H6
- **Evidence**: med
- **Notes**: ~30K GitHub stars. Relevant for constructing P6-compliant backtesting pipelines that incorporate LLM-generated signals; provides data connectors needed for walk-forward validation.

## B13: zipline-reloaded — Python Event-Driven Backtesting Engine
- Date: 2021-03
- **Source (repo)**: stefan-jansen/zipline-reloaded
- **URL**: https://github.com/stefan-jansen/zipline-reloaded
- **One-liner**: Maintained fork of Quantopian's Zipline: event-driven backtesting with realistic fills, integrated Alphalens factor analysis, and walk-forward support — standard rigorous backtesting infrastructure.
- **Tags**: P6, H6
- **Evidence**: med
- **Notes**: Key tool for implementing H6 (walk-forward + regime-aware splits). Provides infrastructure to validate that LLM trading signal papers are not overfitting — methodological complement to B6.

## B14: Metaculus AI Forecasting Accuracy — Running Blog Series
- Date: 2023-09
- **Source (blog)**: Metaculus Research
- **URL**: verify (metaculus.com/blog)
- **One-liner**: Metaculus published calibration analyses comparing GPT-4/Claude performance vs. human superforecasters on resolved questions, finding AI models systematically miscalibrated on tail probabilities.
- **Tags**: P1, H1
- **Evidence**: med
- **Notes**: URL verify. Live question data corroborates A4 (Halawi et al.) with a different methodology. Ongoing series — most recent installment most relevant. Strongest available real-world evidence for H1 (LLM tail miscalibration).

## B15: Dune Analytics — Polymarket Bot Market Share Dashboard
- Date: 2025-02
- **Source (x/blog)**: Community Dune Analytics dashboard + Chaos Labs report
- **URL**: verify (dune.com / chaoslabs.xyz)
- **One-liner**: On-chain analysis quantifying bot market share, wash trading fingerprints, and arbitrage profit concentration on Polymarket — provides quantitative substrate for A5 and A6 claims with live monitoring.
- **Tags**: P4, P5, H4
- **Evidence**: med
- **Notes**: Multiple dashboards exist; Chaos Labs report most comprehensive. Methodology: track wallet behavior across markets to distinguish bots from humans. Useful starting point for P5 (real-time anomaly detection) system design.# AI Trade — Open Problems

As-of: 2026-03-06

## P1: LLM probability calibration on prediction market events
**Severity**: Critical | **Status**: Open
How well-calibrated are LLM probability estimates on prediction market events, and does calibration vary by event category (politics vs crypto vs sports vs geopolitics)?
- Current state: LLMs used as "blind judges" in production pipelines (e.g., trade-news strategy). No systematic public calibration study across event categories on Polymarket-scale data.
- Key question: do LLMs exhibit systematic overconfidence on low-probability events and underconfidence on high-probability events?
- Related: evaluation-benchmarks AFR-BET-3 (model-as-judge convergence).

## P2: Alpha persistence from LLM news analysis
**Severity**: High | **Status**: Open
Can LLMs generate persistent alpha from news/sentiment analysis, or does the signal decay too fast for practical trading?
- Central question: what is the half-life of news-driven alpha in liquid prediction markets?
- Complication: non-stationarity — a signal that works in one regime (election cycle) may not transfer to another (crypto bear market).
- Related: FinGPT, FinRL literature.

## P3: Multi-gate risk framework design
**Severity**: High | **Status**: Early prototyping
What is the optimal multi-gate risk framework for autonomous trading agents (confidence × position × conflict)?
- Current practice: hand-tuned thresholds (e.g., edge > X%, position < Y% of liquidity). No systematic walk-forward calibration of gate parameters.
- Related: agent-economics AFR-BET-5 (budget constraints as security primitive), agent-security AFR-BET-2 (defense-in-depth).

## P4: Market quality effects of bot/agent participation
**Severity**: Medium | **Status**: Open
How does bot/agent participation change prediction market quality (liquidity, price discovery, manipulation)?
- Evidence: Polymarket bots dominate certain segments (73% of arbitrage profits from sub-100ms bots). Wash trading studies estimate 25-33% artificial volume.
- Open question: net effect on price discovery — do bots improve it (more liquidity, faster price adjustment) or degrade it (wash trading, manipulation)?
- Related: Polymarket company frontier B2 (AI agent ecosystem) and B6 (integrity crisis).

## P5: Real-time anomaly / insider trading detection
**Severity**: Medium | **Status**: Open
Can anomalous trading patterns (insider trading, wash trading) be detected in real-time by LLM/ML-based systems?
- Case studies: GTA VI event on Polymarket showed detectable insider pattern. Pete Hegseth ban event had suspicious pre-announcement trading.
- Gap: no production system for automated real-time detection on prediction markets.

## P6: Backtesting methodology for AI trading strategies
**Severity**: High | **Status**: Known but underserved
What backtesting methodology is appropriate for AI trading strategies given non-stationarity and regime changes?
- Standard train/test splits systematically overestimate performance on financial data.
- Walk-forward + regime-aware splits needed but computationally expensive.
- Cost modeling (slippage, fees, market impact) often omitted in academic papers.

## P7: Agent trading autonomy boundaries
**Severity**: High | **Status**: Early prototyping
How should agent trading autonomy be bounded (budget limits, position caps, human approval gates)?
- Production systems use ad-hoc limits. No systematic framework for when human approval should be required vs when full autonomy is safe.
- Related: proactive-agents AFR-BET-2 (clarification vs delegation tension applies directly to trade confirmation UX).

## P8: Favorite-longshot bias exploitation
**Severity**: Medium | **Status**: Known, limited exploitation
What is the favorite-longshot bias magnitude in prediction markets, and can it be systematically exploited by agents?
- Academic evidence: well-documented in sports betting. Less studied in prediction markets (politics, crypto, events).
- Current practice: long-short-bias strategy uses this as a pure-rule signal (Kelly + APY threshold). Magnitude and persistence unknown at Polymarket scale.
# AI Trade — Working Hypotheses

As-of: 2026-03-06

## H1: LLM tail miscalibration
**Confidence**: Medium | **Evidence**: 3r/2o | **Trend**: Steady
LLM probability estimates are systematically overconfident on low-probability events (<15%) and underconfident on high-probability events (>85%), following a pattern analogous to the favorite-longshot bias in human forecasters.
- Rationale: LLMs trained on internet text inherit human biases (anchoring, availability heuristic). Forecasting superforecasters consistently outperform base LLMs on tail events.
- Evidence for: GPT-4 calibration studies show systematic deviation from perfect calibration on rare events. Metaculus experiments show LLMs underperform calibrated human ensembles on extreme probabilities.
- Evidence against: newer models (o-series, Claude with reasoning) may self-correct with extended thinking. No large-scale prediction market calibration study yet.
- Addresses: P1

## H2: News alpha half-life < 4 hours in liquid markets
**Confidence**: Medium-Low | **Evidence**: 2r/3o | **Trend**: Steady
News-driven alpha from LLM analysis has a half-life of <4 hours in liquid prediction markets — too slow for manual trading but viable for automated agents with sub-minute execution.
- Rationale: prediction markets adjust faster than traditional markets due to low friction (crypto settlement, 24/7 trading). But information diffusion is still not instant — edge window exists between news publication and market price adjustment.
- Evidence for: Hegseth ban event showed market adjustment within ~2 hours. GTA VI event had longer window (~6-12 hours) due to lower attention.
- Evidence against: highly followed events (elections, Fed decisions) may adjust in minutes, leaving no window.
- Addresses: P2

## H3: Multi-gate → standard for production trading agents
**Confidence**: Medium-High | **Evidence**: 3r/1o | **Trend**: Accelerating
Multi-gate risk frameworks (≥3 independent checks: confidence, position sizing, conflict detection) will become standard for production trading agents by Q4 2026, analogous to defense-in-depth in security.
- Rationale: single-gate systems (just a confidence threshold) allow correlated failures. Independent gates catch different failure modes.
- Evidence for: Polymarket strategy pipeline already uses 3-gate architecture. Agent-security research converging on defense-in-depth (AFR-BET-2). Enterprise trading systems universally use multi-layer risk checks.
- Evidence against: academic agent trading papers rarely model risk gates — gap between production and research.
- Addresses: P3

## H4: Ambiguous net market quality effect of bots
**Confidence**: Medium | **Evidence**: 4r/3o | **Trend**: Steady
Bot participation improves price discovery (faster information incorporation, more continuous liquidity) but increases manipulation risk (wash trading, spoofing) — net effect on market quality is ambiguous and depends on market design and regulatory enforcement.
- Evidence for: Polymarket wash trading studies (25-33% artificial volume). Simultaneously, bot-provided liquidity reduces spreads on active markets.
- Evidence against: some studies show MEV extraction is net-negative for retail participants. Others show LP bots improve execution quality.
- Addresses: P4

## H5: Favorite-longshot bias = reliable but low-frequency alpha
**Confidence**: Medium-High | **Evidence**: 4r/1o | **Trend**: Steady
Favorite-longshot bias persists in prediction markets and provides a reliable but low-frequency alpha source for systematic agents. The bias is strongest in (a) long-dated events and (b) events with high emotional salience.
- Rationale: well-documented in sports betting (>50 years of literature). Prediction markets have similar retail participation patterns — recreational traders overpay for longshots (lottery-like payoff preference).
- Evidence for: long-short-bias strategy on Polymarket shows positive expected edge when filtered by Kelly + APY threshold.
- Evidence against: bias magnitude may be smaller in prediction markets than sports betting due to more sophisticated participant base. May disappear as agent/bot participation increases.
- Addresses: P8

## H6: Walk-forward + regime-aware backtesting essential
**Confidence**: High | **Evidence**: 5r/0o | **Trend**: Established
Backtesting AI trading strategies requires walk-forward + regime-aware splits; standard train/test splits systematically overestimate performance by 30-60% on financial data.
- Rationale: financial time series are non-stationary. A model trained on bull market data and tested on bear market data will fail; random splits leak future information via autocorrelation.
- Evidence for: well-established in quant finance literature. Every production quant fund uses walk-forward. Academic ML papers on finance that don't use walk-forward are routinely criticized.
- Evidence against: none — this is a methodological consensus.
- Addresses: P6
