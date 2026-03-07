---
title: "预测市场"
subtitle: "Polymarket 机制、定价原理、套利策略——信息交易的终极战场"
date: "2026-03-08"
tier: "2"
order: 8
time: "25 min"
tags: ["Prediction Markets", "Polymarket", "Probability", "D0", "Arbitrage"]
description: "理解预测市场的运作机制，学会评估市场隐含概率是否合理，发现定价偏差并进行套利。结合 LLM 概率校准提升预测准确率。"
commands: ["d0 call DONUT_POLYMARKET_MARKETS", "d0 research", "d0 ta"]
status: "available"
---

## 预测市场是什么？

预测市场允许用户对未来事件的结果进行押注：

```
问题："2026年 BTC 会突破 $100,000 吗？"
选项：YES shares / NO shares
当前价格：YES = $0.42，NO = $0.58

市场隐含概率：42% 认为 BTC 会突破 10 万
```

每个 share 在事件结算时值 $1（结果正确）或 $0（结果错误）。

---

## Polymarket 核心机制

```
CLOB（中央限价订单簿）：
  与永续合约类似，有买卖挂单
  价格范围 $0.00 - $1.00

结算：
  结果为 YES → YES shares = $1，NO shares = $0
  结果为 NO  → NO shares = $1，YES shares = $0

流动性：
  LP（流动性提供者）提供双边报价
  套利者维持价格合理
```

---

## 定价偏差：利润来源

预测市场经常出现系统性定价偏差：

**1. 支持者偏差（Favorite-Longshot Bias）**：
```
热门选项（> 80% 概率）：通常被低估
冷门选项（< 20% 概率）：通常被高估

例：某候选人真实胜率 90%，市场定价 82%
→ 买 YES @ $0.82 是价值交易
```

**2. LLM 校准偏差**（见 DR 研究）：
```
LLM 倾向于高估低概率事件
用 LLM 评估的概率与市场比较：
- LLM 说 15%，市场定价 8% → 考虑买 YES
- LLM 说 5%，市场定价 12% → 考虑买 NO
```

---

## 套利策略

**跨市场套利**：
```
同一事件在不同市场定价不同

Polymarket YES = $0.45
Kalshi YES = $0.51

→ 在 Polymarket 买 YES，在 Kalshi 买 NO
→ 无论结果如何，锁定 $0.06 利润（扣除手续费）
```

**YES + NO 套利**：
```
YES + NO 价格之和应等于 $1.00 + 少量手续费

YES = $0.43，NO = $0.54
YES + NO = $0.97 < $1.00

→ 同时买 YES 和 NO，保证获得 $1.00 收益
→ 净利润 = $1.00 - $0.97 = $0.03（3%）
```

---

## 用 D0 参与 Polymarket

```bash
# 查看当前 Polymarket 市场
d0 call DONUT_POLYMARKET_MARKETS

# 查看特定市场的订单簿
d0 call DONUT_POLYMARKET_ORDERBOOK market_id:<id>

# 下单
d0 call DONUT_POLYMARKET_BUY \
  token_id:<token_id> \
  side:BUY \
  size:100 \
  price:0.42
```

---

## 评估框架

```
第一步：读懂问题
  - 结算时间？
  - 结算条件是什么？（精确定义）
  - 有没有模糊地带可能导致争议？

第二步：独立评估概率
  - 用 LLM 分析 + 自己判断
  - 与市场价格比较

第三步：判断是否有边际优势
  - 你的评估 vs 市场定价，差距 > 5% 才值得入场
  - 越接近 50%，交易成本占比越高，需要更大偏差

第四步：仓位管理
  - 预测市场单笔不超过账户 5%
  - 多样化下注，不押单一事件
```

---

## 核心概念回顾

- **预测市场**：用 $0-$1 价格反映事件发生概率
- **支持者偏差**：热门选项常被低估，冷门常被高估
- **套利机会**：跨平台、YES+NO 套利，风险较低
- **关键技能**：独立评估概率，寻找与市场的偏差
