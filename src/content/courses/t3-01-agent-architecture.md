---
title: "AI 交易 Agent 架构"
subtitle: "意图解析、策略路由、执行引擎——构建端到端自主交易系统"
date: "2026-03-08"
tier: "3"
order: 9
time: "40 min"
tags: ["Agent Architecture", "Intent Parsing", "Pipeline", "D0", "LLM"]
description: "设计和构建完整的 AI 自主交易 Agent：从自然语言意图到链上执行的完整 pipeline，包括数据层、信号层、决策层、执行层和监控层。"
commands: ["d0 price", "d0 ta", "d0 research", "d0 hl:limit buy", "d0 hl:positions", "d0 hl:close"]
status: "available"
---

## Agent 架构的五层模型

一个完整的自主交易 Agent 需要五层协同工作：

```
┌─────────────────────────────────────────────┐
│  LAYER 5: INTERFACE                         │
│  自然语言输入 / 提醒输出 / 报告生成          │
├─────────────────────────────────────────────┤
│  LAYER 4: MONITORING                        │
│  持仓追踪 / 风控监控 / 止损触发             │
├─────────────────────────────────────────────┤
│  LAYER 3: EXECUTION                         │
│  D0 CLI / 订单管理 / 仓位控制               │
├─────────────────────────────────────────────┤
│  LAYER 2: DECISION                          │
│  策略引擎 / 信号融合 / 仓位计算             │
├─────────────────────────────────────────────┤
│  LAYER 1: DATA                              │
│  价格数据 / 技术指标 / 链上数据 / 新闻      │
└─────────────────────────────────────────────┘
```

---

## Layer 1：数据层

```bash
# 价格和技术分析
d0 price ETH
d0 ta ETH

# 链上研究数据
d0 research ETH

# 市场情绪
d0 sentiment
```

数据层输出标准化结构：

```json
{
  "asset": "ETH",
  "price": 3247.50,
  "rsi": 34.2,
  "macd": "bullish_cross",
  "signal": "LONG",
  "confidence": 0.62,
  "exchange_flow": "outflow",
  "whale_activity": "accumulating"
}
```

---

## Layer 2：决策层

融合多信号，输出交易决策：

```python
def make_decision(data):
    score = 0
    
    # 技术信号
    if data['rsi'] < 35:    score += 2
    if data['macd'] == 'bullish_cross': score += 2
    if data['signal'] == 'LONG': score += 1
    
    # 链上信号
    if data['exchange_flow'] == 'outflow': score += 1
    if data['whale_activity'] == 'accumulating': score += 2
    
    # 决策阈值
    if score >= 6:
        return {
            'action': 'BUY',
            'confidence': score / 8,
            'size': calculate_kelly_size(score)
        }
    return {'action': 'HOLD'}
```

---

## Layer 3：执行层（D0）

```bash
# 接收 Layer 2 的决策，转化为 D0 命令
DECISION = {"action": "BUY", "confidence": 0.75, "size": 0.1}

# 执行
d0 hl:leverage ETH 2
d0 hl:limit buy ETH 0.1 3200
d0 hl:stop-loss ETH 0.1 3040
```

D0 是执行层的标准接口，任何决策引擎都可以通过相同的命令格式输出。

---

## Layer 4：监控层

```bash
# 持续监控持仓状态
while True:
    d0 hl:positions    # 检查 PnL
    d0 ta ETH          # 检查信号是否反转
    
    if signal_reversed:
        d0 hl:close ETH
        break
    
    sleep(1800)  # 每30分钟检查
```

---

## Layer 5：交互层

自然语言输入 → 结构化命令：

```
用户说："帮我在 ETH 回调到 3100 时买入"

Agent 解析：
  asset = ETH
  trigger = price <= 3100
  action = buy
  size = default (1% risk)

Agent 执行：
  d0 hl:limit buy ETH <size> 3100
```

---

## 完整 Pipeline 示例

```bash
#!/bin/bash
# trading-agent.sh — 简化版自主交易 Agent

while true; do
  # 数据层
  PRICE=$(d0 price ETH | grep -o '[0-9,]*\.[0-9]*' | head -1)
  TA=$(d0 ta ETH)
  
  # 决策层（解析 D0 输出的 Signal）
  SIGNAL=$(echo "$TA" | grep "Signal:" | awk '{print $2}')
  CONFIDENCE=$(echo "$TA" | grep "confidence:" | grep -o '[0-9]*%' | tr -d '%')
  
  # 执行层
  if [ "$SIGNAL" = "LONG" ] && [ "$CONFIDENCE" -gt 65 ]; then
    echo "Signal: LONG, Confidence: ${CONFIDENCE}% — Executing..."
    d0 hl:leverage ETH 2
    d0 hl:limit buy ETH 0.05 $PRICE
    d0 hl:stop-loss ETH 0.05 $(echo "$PRICE * 0.95" | bc)
  fi
  
  sleep 3600  # 每小时检查一次
done
```

---

## 核心概念回顾

- **五层架构**：数据→决策→执行→监控→交互
- **D0 = 执行层**：标准化接口，任何决策引擎都能调用
- **信号融合**：多维度评分，超过阈值才执行
- **持续监控**：自动检测反转信号，及时平仓
