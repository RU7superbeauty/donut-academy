---
title: "合约与资金费率"
subtitle: "永续合约机制、Funding Rate 策略、杠杆管理——HyperLiquid 实战"
date: "2026-03-08"
tier: "2"
order: 6
time: "30 min"
tags: ["Perpetual Futures", "Funding Rate", "Leverage", "HyperLiquid", "D0"]
description: "深入理解永续合约工作机制：资金费率如何产生、清算如何发生、杠杆如何影响持仓成本，以及基于资金费率的套利策略完整实现。"
commands: ["d0 hl:positions", "d0 hl:leverage", "d0 hl:balance", "d0 hl:limit buy", "d0 hl:close"]
status: "available"
---

## 永续合约 vs 现货

永续合约（Perpetual Futures）是没有到期日的合约，通过资金费率机制锚定现货价格：

```
现货：直接持有代币，无到期日，无杠杆（除非 DeFi 借贷）

永续合约：
  ✓ 可以做多（买涨）或做空（买跌）
  ✓ 最高支持 50x 杠杆
  ✓ 没有到期日，通过资金费率与现货价格对齐
  ✗ 需要支付/收取资金费率
  ✗ 有清算风险
```

---

## 资金费率机制

每 8 小时，多空双方之间互相支付费率：

```
市场偏多（多头 > 空头）→ 正费率 → 多头付给空头
市场偏空（空头 > 多头）→ 负费率 → 空头付给多头

目的：强迫永续合约价格向现货价格靠拢
```

**实际影响**：

```bash
d0 hl:positions

# 你持有 1 ETH 多头，当前资金费率 +0.05%/8h
# 每天成本 = 1 ETH × $3,247 × 0.05% × 3次 = $4.87/天

# 这意味着：每天 ETH 需要上涨 0.15% 你才能保本
```

---

## 清算机制

当账户净值不足以支撑当前仓位时，系统强制平仓：

```
清算价格计算：

做多 ETH，入场 $3,200，2x 杠杆，$160 保证金
维持保证金率 = 0.5%（HyperLiquid）

清算价格 ≈ 入场价 × (1 - 1/杠杆 + 维持保证金率)
         = $3,200 × (1 - 0.5 + 0.005)
         = $3,200 × 0.505
         = $1,616
```

**实际查看清算价**：

```bash
d0 hl:positions
# 输出包含 Liq.Price（清算价格）
# ETH-PERP LONG 0.1 ETH
#   Entry:     $3,200
#   Liq.Price: $1,616  ← 价格需要跌 50% 才清算
```

**安全原则**：清算价格应距离当前价格 > 30%（2x 杠杆以内基本满足）。

---

## HyperLiquid 实战指南

```bash
# 1. 查看账户状态
d0 hl:balance
# Available:    $200.00 USDC
# In positions: $0.00
# Total equity: $200.00 USDC

# 2. 设置杠杆（建议 1-3x）
d0 hl:leverage ETH 2

# 3. 建仓（限价，减少滑点）
d0 hl:limit buy ETH 0.05 3200
# 订单 ID 保存好，用于后续查询

# 4. 确认成交
d0 hl:orders       # 查看挂单
d0 hl:positions    # 查看持仓

# 5. 设置止损
d0 hl:stop-loss ETH 0.05 3040

# 6. 查看资金费率影响
d0 hl:positions
# 每 8h 结算一次，在 PnL 中体现
```

---

## 资金费率套利完整策略

详见 [Playbook: Funding Rate Arbitrage](/playbook/funding-rate-arb/)

核心逻辑：
```
资金费率 > 0.1%/8h → 做空收费率
资金费率 < -0.1%/8h → 做多收费率

止损：入场价 ±8%
持仓：直到费率回归正常（< 0.02%）
```

---

## 核心概念回顾

- **永续合约**：无到期日，通过资金费率锚定现货
- **资金费率**：每 8h 结算，正费率多头付，负费率空头付
- **清算**：当净值不足时系统强平，杠杆越高清算价越近
- **安全杠杆**：1-3x，清算价距离当前价 > 30%
