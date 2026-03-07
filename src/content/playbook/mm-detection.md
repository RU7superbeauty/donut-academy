---
title: "Market Maker Pattern Detection"
subtitle: "链上做市商行为识别：C型阶梯拉盘与E型掩护出货模式"
date: "2026-03-08"
difficulty: "⭐⭐⭐⭐ Expert"
time: "45 min"
category: "ON-CHAIN ANALYTICS"
tags: ["Market Maker", "Pattern Recognition", "On-Chain", "D0", "DR-005"]
description: "基于 DR-005 研究成果，使用 D0 在链上数据中识别做市商的 C型（阶梯拉盘）和 E型（掩护出货）行为模式，在异常信号出现时提前布局。"
commands: ["d0 search", "d0 ta", "d0 research", "d0 price", "d0 hl:limit buy"]
prerequisites: ["Complete Quick Start", "Read DR-005 research paper", "Funded account $200+"]
---

## Background: DR-005 Research

本 Playbook 基于 Donut Research DR-005 的研究成果。详细理论见 [DR-005: On-Chain Behavioral Fingerprinting](/articles/dr-005-mm-pattern-detection/)。

**核心发现**：做市商在运营约束下会产生可识别的链上行为模式，主要分两类：

### C-Type Pattern（阶梯拉盘）
```
特征：
- 规律性小额买单堆积（非随机分布）
- 买卖价差逐步收窄
- 成交量阶梯式放大
- 通常出现在大幅拉升前 6-24h

信号意义：MM 在为大幅上涨做准备，主动收集筹码
```

### E-Type Pattern（掩护出货）
```
特征：
- 价格维持在高位但成交量异常放大
- 大量小额卖单分散在不同价位
- 买盘看似活跃但实为MM自买自卖（wash trading）
- 链上大地址持有量悄然下降

信号意义：MM 在用活跃成交掩护大额出货
```

---

## Step 1: Identify Target Tokens

寻找可能存在 MM 行为的标的：

```bash
# 搜索近期成交量异常的代币
d0 search "high volume unusual"

# 或直接研究特定代币
d0 research BONK

# 查看技术面
d0 ta BONK
```

**筛选标准**：
- 中小市值（$10M - $500M FDV）
- 近期成交量 > 30天均值 2x 以上
- 价格在近期高点附近震荡

---

## Step 2: Analyze Order Flow Patterns

使用 D0 研究工具分析链上数据：

```bash
# 综合链上研究
d0 research <TOKEN>

# 关注以下字段：
# - large_transactions: 大额交易笔数
# - top_holder_changes: 前10持有者变化
# - exchange_flow: 交易所流量
# - wash_trading_score: 洗盘评分
```

**C-Type 识别清单**：
```
□ 过去24h 出现 >5 笔 $10K-50K 的规律性买单
□ 买卖价差从 0.3% → 0.1% 收窄
□ 成交量阶梯式上升（非随机）
□ 主力地址持仓持续增加
□ 前10持有者集中度上升
```

**E-Type 识别清单**：
```
□ 成交量 > 7日均值 5x 以上
□ 大地址（whale）持仓过去48h 下降
□ 价格在高位横盘 > 6h 无突破
□ 链上 wash trading score 异常高
□ 多个小地址频繁互相转账（疑似控盘地址）
```

---

## Step 3: Pattern Confirmation

确认模式后，判断方向：

**检测到 C-Type → 考虑做多**：

```bash
# 确认技术面配合
d0 ta <TOKEN>
# 期望看到：RSI 40-60，MACD 走平或金叉，成交量放大

# 查看当前价格
d0 price <TOKEN>

# 建仓（在 C-Type 阶梯买单出现区域入场）
d0 hl:limit buy ETH 0.1 <CURRENT_PRICE>

# 止损设在 C-Type 支撑区下方 3%
d0 hl:stop-loss ETH 0.1 <STOP_PRICE>
```

**检测到 E-Type → 规避或做空**：

```bash
# 如果持有该代币，考虑减仓
d0 hl:close <TOKEN>

# 如果要做空（需确认更多信号）
d0 hl:limit sell ETH 0.05 <CURRENT_PRICE>
d0 hl:stop-loss ETH 0.05 <STOP_PRICE>  # 止损 +5%
```

---

## Step 4: Position Sizing for MM Detection

MM 行为识别是**高风险高收益**策略，仓位管理极为重要：

| 信号强度 | 确认条件满足 | 建议仓位 |
|---|---|---|
| 弱（1-2个信号）| 低 | 不入场 |
| 中（3-4个信号）| 中 | 账户 5% |
| 强（5+个信号）| 高 | 账户 10-15% |

```bash
# 确认账户状态
d0 hl:balance

# 计算仓位
# 账户 $500 × 10% = $50 仓位
# 不使用高杠杆（1-2x）
d0 hl:leverage ETH 1
```

---

## Step 5: Exit Signals

**C-Type 做多退出**：
- 成交量突然萎缩（MM 停止买入）→ 警惕
- 价格突破阶梯上轨 +5% → 部分止盈
- 前10持有者出现减仓 → 立即平仓

**E-Type 做空退出**：
- 出货完成，价格开始加速下跌 → 持仓
- 突破高点（止损触发）→ 平仓
- 超过 72h 无方向 → 止盈（时间止损）

```bash
# 查看当前持仓和信号变化
d0 hl:positions
d0 research <TOKEN>  # 重新评估链上数据

# 止盈平仓
d0 hl:close <TOKEN>
```

---

## Advanced: Automation Script

```bash
#!/bin/bash
# mm-scanner.sh - 扫描多个代币的 MM 信号

TOKENS=("ETH" "BTC" "SOL" "BONK")

for token in "${TOKENS[@]}"; do
  echo "=== Scanning $token ==="
  d0 research $token
  d0 ta $token
  echo "---"
  sleep 2  # 避免 API 限速
done
```

---

## Risk Warnings

MM 行为识别策略风险极高，特别注意：

- **MM 可以反方向操作**：识别出 C-Type 不代表一定拉升，MM 可以随时停止
- **数据可能滞后**：链上数据有延迟，当你看到信号时 MM 可能已经完成操作
- **被 MM 反向收割**：如果你的策略被 MM 识别，他们可能故意制造虚假信号
- **流动性风险**：中小市值代币流动性差，大额止损可能造成严重滑点

> **NFA / DYOR**：本 Playbook 基于研究理论，实际交易结果可能显著不同。MM 检测是高难度技能，建议先用小仓位练习。

---

## Further Reading

- [DR-005: On-Chain Behavioral Fingerprinting](/articles/dr-005-mm-pattern-detection/) — 完整研究论文
- [DR-004: Multi-Agent Game Theory](/articles/dr-004-multi-agent-game-theory/) — MM 博弈理论背景
- [DR-003: Risk Failure Modes](/articles/dr-003-risk-failure-modes/) — 黑天鹅风险管理
