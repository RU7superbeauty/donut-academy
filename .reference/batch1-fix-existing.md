# Batch 1: Fix Existing 3 Articles

Read `.reference/writing-rules.md` and `.reference/ai-trade-frontier.md` first.

Fix these 3 existing articles in `src/content/articles/`:

## 1. agent-economy-thesis.md
- Remove "I've spent the last 18 months watching..." → Replace with neutral framing
- Remove "based on internal benchmarks across 1,200 trading intent samples we've tested" → Replace with "Studies on LLM intent parsing show..."
- Remove "87-92% of the time" → Replace with "with high reliability" or find a real benchmark
- "Copin's own data shows copy-traders underperform their leaders by 12-18%" → Change to "Copy-trading structurally underperforms due to execution delays" (remove fake number)
- "A 2024 analysis of grid bot performance...67%" → Remove specific fake stat, describe the structural failure mode instead
- "autonomous agents already manage over $5B in TVL" → Verify or change to "billions" without specific number
- Keep: algo trading 60-75% stat (verified), Kelly criterion math (correct), FX >80% (verified)
- Keep: D0 product descriptions, architecture diagrams, composable skill discussion

## 2. llm-probability-calibration.md
- Remove "I've spent the last eight months studying..." → Neutral framing
- **DELETE the fabricated calibration table** (GPT-4/Claude/Llama numbers are made up)
- **DELETE fabricated ECE scores** (GPT-4: ~0.08-0.10 etc.)
- Replace with: cite Halawi et al. (2024, arXiv 2402.18563) "Approaching Human-Level Forecasting with Language Models" — their actual finding: LLM pipeline nears competitive human crowd forecast accuracy, and in some settings surpasses it
- Cite the PMC study: Schoenegger et al. (2025) "Wisdom of the silicon crowd: LLM ensemble prediction capabilities rival human crowd accuracy" — ensemble of 12 LLMs statistically indistinguishable from human crowd
- Keep discussion of Zou et al. (2022) but remove fabricated specific gap numbers
- Keep Snowberg & Wolfers (2010) discussion (verified, B5 in frontier)
- Keep Bailey et al. (2015) discussion (verified, B6 in frontier)
- Remove "The sweet spot I've identified from backtesting" → Change to "The theoretical sweet spot based on bias analysis"
- Remove "This single adjustment eliminated roughly 40% of the trades" → Remove fake result
- Keep: Brier score and ECE formulas (correct), Kelly criterion math (correct), multi-gate framework discussion (aligns with P3/H3)
- Keep: Platt scaling and isotonic regression descriptions (correct methodology)

## 3. agentic-trading-stack.md
- Remove "I've spent the last 18 months mapping them" → Neutral framing
- "according to a 2024 analysis...62% of codebase on exchange integration" → Change to "A significant majority of trading bot codebases are dedicated to exchange integration plumbing"
- "failure rate is around 15-20%" → Change to "high failure rates"
- "agents using the unified D0 interface made 67% fewer errors" → Remove specific fake stat
- "94% accuracy...41% accuracy" → Remove specific fake comparison numbers
- "zero-config read access reduced agent onboarding time from 45 minutes...to under 10 seconds" → Soften to "dramatically reduces onboarding time"
- "A 2025 analysis of DeFi exploits found that 73% of losses above $10M" → Remove specific fake stat
- "under 800ms" → Change to "sub-second"
- "adding a dedicated risk agent reduced maximum portfolio drawdown by 34%" → Remove specific fake stat
- Keep: 5-layer stack architecture (good framework), code examples (illustrative), exchange abstraction discussion, composability section

After fixing all 3, commit with message: "fix: remove fabricated data, add real citations"
Do NOT push (other batches will commit too, we push once at end).
