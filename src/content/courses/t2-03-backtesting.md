---
title: "回测方法论"
subtitle: "历史数据回测框架、Walk-Forward 验证——避免过拟合的科学方法"
date: "2026-03-08"
tier: "2"
order: 7
time: "25 min"
tags: ["Backtesting", "Walk-Forward", "Overfitting", "Sharpe Ratio", "D0"]
description: "学会正确回测交易策略：避免常见陷阱（过拟合、前视偏差、存活者偏差），使用 Walk-Forward 验证确保策略在真实市场中有效。"
commands: ["d0 ta", "d0 price", "d0 research"]
status: "available"
---

## 为什么大多数回测结果是假的

"我的策略回测年化 300%！"——这句话背后90%是过拟合。

回测常见陷阱：

```
1. 前视偏差（Look-Ahead Bias）
   错误：用未来数据做决策
   例如：用当天收盘价决定当天是否开仓

2. 过拟合（Overfitting）
   在历史数据上调参数直到完美，但参数对未来无效

3. 存活者偏差（Survivorship Bias）
   只测试当前还存在的代币，忽略了那些归零的

4. 交易成本忽略
   没有计算滑点、手续费、资金费率
```

---

## 正确的回测流程

```
数据集划分（严格遵守）：

全部数据 100%
├── 训练集 60%    → 策略开发和初步参数
├── 验证集 20%    → 参数调优
└── 测试集 20%    → 最终评估（只用一次！）

规则：测试集只能使用一次。每次看测试集结果，
都算在"使用次数"里，多次查看等于再次过拟合。
```

---

## Walk-Forward 验证

Walk-Forward 是更严格的回测方法，模拟真实交易：

```
时间轴：
|----训练----|--测试--|
     向前滚动
         |----训练----|--测试--|
              向前滚动
                  |----训练----|--测试--|

每个窗口独立训练和测试，取所有测试期的综合表现
```

**这样可以**：
- 检验策略在不同市场环境下是否稳健
- 发现参数是否需要随时间调整
- 更接近真实交易体验

---

## 关键评估指标

```
Sharpe Ratio = (年化收益 - 无风险利率) / 年化波动率

> 1.0：可接受
> 1.5：良好
> 2.0：优秀

最大回撤（Max Drawdown）：
= 从最高点到最低点的最大跌幅
> -30% 的策略通常难以坚持执行

胜率 vs 盈亏比：
胜率 45% + 盈亏比 2.5:1 > 胜率 65% + 盈亏比 1:1
（期望值：0.45×2.5 - 0.55×1 = 0.575 vs 0.65-0.35 = 0.30）
```

---

## 用 D0 数据回测

```bash
# D0 提供技术分析历史信号作为参考
d0 ta ETH    # 当前技术状态
d0 ta BTC    # 对比参考

# 结合 d0 research 的历史数据
d0 research ETH
```

**简单手动回测框架**：

```python
# 伪代码示例
strategy_returns = []

for each_day in historical_data:
    signal = get_ta_signal(day)  # LONG/SHORT/NEUTRAL
    
    if signal == "LONG":
        entry = day.close
        stop_loss = entry * 0.95
        target = entry * 1.10
        
        # 模拟持仓
        result = simulate_trade(entry, stop_loss, target, next_days)
        strategy_returns.append(result)

sharpe = calculate_sharpe(strategy_returns)
max_dd = calculate_max_drawdown(strategy_returns)
```

---

## 核心概念回顾

- **过拟合**：历史完美但未来失效，Walk-Forward 可检验
- **测试集**：只能用一次，多次查看等于污染
- **Sharpe > 1.5**：策略可接受的最低标准
- **最大回撤**：超过 -30% 往往难以坚持执行
