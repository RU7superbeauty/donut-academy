---
title: "Funding Rate Arbitrage with D0"
subtitle: "资金费率套利：当市场情绪极端时，持有反向仓位收取费率溢价"
date: "2026-03-08"
difficulty: "⭐⭐ Intermediate"
time: "20 min"
category: "PERPS STRATEGY"
tags: ["Funding Rate", "HyperLiquid", "Arbitrage", "D0", "Perps"]
description: "使用 D0 实现资金费率套利策略。当 ETH/BTC 永续合约资金费率显著偏离零时，持有反方向仓位系统性收取费率溢价。"
commands: ["d0 hl:balance", "d0 hl:positions", "d0 hl:limit buy", "d0 hl:leverage", "d0 hl:stop-loss"]
prerequisites: ["Complete Quick Start", "Funded HyperLiquid account (min $50 USDC)"]
---

## What is Funding Rate Arbitrage?

永续合约通过**资金费率（Funding Rate）**机制锚定现货价格。每8小时，多空双方之间互相支付费率：

- **正费率**：多头向空头支付（市场偏多时）
- **负费率**：空头向多头支付（市场偏空时）

**套利逻辑**：当资金费率持续显著偏离零时，持有反方向仓位可以系统性收取这笔费率收益，且不需要对价格方向做任何判断。

```
Expected_profit_per_8h = |funding_rate| × position_size
Edge = |funding_rate| - transaction_costs - slippage

Rule: Only enter when |funding_rate| > 0.05% per 8h (~2.2% APR)
```

---

## Step 1: Monitor Funding Rates

首先查看当前各市场的资金费率：

```bash
# 查看 HyperLiquid 持仓和资金费率
d0 hl:positions

# 查看账户整体情况
d0 hl:balance
```

**寻找机会**：资金费率 `> 0.05%/8h` 或 `< -0.05%/8h` 时值得关注。

> **经验法则**：资金费率 > 0.1%/8h（约 4.4% APR）时，套利收益可覆盖交易成本并留有余量。

---

## Step 2: Assess Your Position Size

资金费率套利是**低风险但非零风险**策略。价格方向风险通过止损控制：

```bash
# 查看可用余额
d0 hl:balance
```

**仓位建议**：

| 账户规模 | 建议仓位 | 理由 |
|---|---|---|
| $100-500 | $50-100 | 手续费占比高，小仓位 |
| $500-2000 | 20-30% 账户 | 留足对冲空间 |
| $2000+ | 15-25% 账户 | 分散多个品种 |

---

## Step 3: Enter the Position

以资金费率为正（多头支付空头）为例，做空 ETH：

```bash
# 1. 设置杠杆（资金费率套利建议 1-3x，不需要高杠杆）
d0 hl:leverage ETH 2

# 2. 限价做空 ETH（等价格接近时成交，减少滑点）
d0 hl:limit sell ETH 0.05 3250

# 3. 确认仓位
d0 hl:positions
```

**预期输出**：

```
ETH-PERP  SHORT  0.05 ETH
  Entry:    $3,250.00
  Leverage: 2x
  Liq.Price: $4,875.00 (+50%)
```

---

## Step 4: Set Stop-Loss

**这一步不可跳过**。资金费率套利的风险来自价格单边行情：

```bash
# 止损设置在入场价 +8%（空头方向为价格上涨）
# 入场 $3,250，止损 $3,510
d0 hl:stop-loss ETH 0.05 3510
```

**止损逻辑**：

```
Funding income per day  = 0.1% × $162.5 (0.05 ETH × $3250) = $0.49/day
Max loss at stop-loss   = 8% × $162.5 = $13.00
Breakeven holding time  = $13.00 / $0.49 = 26 days
```

如果仓位撑过 26 天没被止损，收益开始正值。

---

## Step 5: Monitor & Close

```bash
# 每日检查（或设置提醒）
d0 hl:positions

# 当资金费率恢复正常（< 0.02%/8h）时平仓
d0 hl:close ETH
```

**平仓信号**：
- 资金费率回归 0.02% 以下
- 已持有 > 7 天收益满意
- 止损被触发（系统自动平仓）

---

## Full Command Sequence

```bash
# 完整执行流程
d0 hl:balance                        # 检查余额
d0 hl:leverage ETH 2                 # 设置杠杆
d0 hl:limit sell ETH 0.05 3250       # 建仓（做空）
d0 hl:positions                      # 确认仓位
d0 hl:stop-loss ETH 0.05 3510        # 设止损（入场价+8%）

# 每日检查
d0 hl:positions                      # 查看 PnL + 资金费率收益

# 平仓
d0 hl:close ETH                      # 市价平仓
```

---

## Risk Summary

| 风险类型 | 说明 | 缓解方式 |
|---|---|---|
| 价格方向风险 | ETH 单边拉升触发止损 | 止损设置在 8%，严格执行 |
| 资金费率反转 | 费率突然转负 | 监控每8h费率，及时平仓 |
| 流动性风险 | 市价平仓滑点 | 使用限价单，仓位不要太大 |
| 清算风险 | 杠杆过高被强平 | 使用 1-2x 杠杆，清算价远离市价 |

> **NFA / DYOR**：这是教育性内容，不构成投资建议。任何交易策略都有亏损风险。
