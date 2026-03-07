---
title: "加密货币基础"
subtitle: "钱包、链、代币标准、Gas 机制——Agent 交易的地基"
date: "2026-03-08"
tier: "1"
order: 1
time: "20 min"
tags: ["Blockchain", "Wallet", "Token", "Gas", "D0"]
description: "理解加密货币基础概念：区块链运作原理、钱包类型、代币标准、Gas 机制，以及 D0 如何在这个基础设施上运行。"
commands: ["d0 price ETH", "d0 search SOL", "d0 balance"]
status: "available"
---

## 为什么 Agent 需要理解这些基础？

大多数交易工具假设你已经理解了链的运作方式。D0 也不例外。本课不是为了让你成为区块链专家，而是让你理解**D0 在哪里运行、为什么这样设计**。

---

## 区块链：不可篡改的交易账本

区块链本质上是一个**分布式账本**——成千上万个节点各自保存一份完整的交易记录，任何人都无法单独修改。

```
传统金融：
  你 → 银行 → 接收方
  银行是中间人，可以冻结、回滚、拒绝

区块链：
  你 → 智能合约 → 接收方
  代码是规则，没有中间人，不可撤销
```

**对 D0 交易的意义**：你在 Hyperliquid 下的每笔订单最终都结算在 Arbitrum 链上。交易一旦确认，没有人可以撤销——包括 D0 和 Donut 团队。

---

## 钱包：你的链上身份

钱包不是存放代币的地方，**代币始终在链上**。钱包只是一对密钥：

```
私钥（Private Key）：32字节的秘密数字
  - 谁有私钥，谁就控制这个地址的资产
  - 永远不要分享，不要存在联网设备上

公钥 → 地址（Address）：可以公开分享
  - 例：0x742d35Cc6634C0532925a3b8D4C9C1F36d14a8f9
  - 别人向这个地址转账，你才能收到
```

**D0 的钱包方案（Turnkey）**：

D0 使用 Turnkey 云端 HSM（硬件安全模块）管理密钥。你登录 D0 账号，Turnkey 负责签名，**你永远不会看到私钥**。

```bash
# 查看你的 D0 钱包地址
d0 hl wallet
# 输出：Address: 0x742d...a8f9 (Arbitrum)
```

优势：不会丢失私钥，不需要备份助记词
劣势：Turnkey 有一定托管风险（见 Quick Start 说明）

---

## 代币标准

| 标准 | 链 | 用途 | D0 相关 |
|---|---|---|---|
| ERC-20 | Ethereum/Arbitrum | 同质化代币（USDC、ETH）| 交易保证金 |
| SPL | Solana | Solana 上的代币 | `d0 price BONK` |
| ERC-721 | Ethereum | NFT（非同质化）| 无 |

**D0 主要操作的资产**：

```bash
# Arbitrum 上的 USDC（HyperLiquid 保证金）
d0 hl:balance

# Solana 上的各种 SPL 代币
d0 price BONK
d0 search SOL
```

---

## Gas：链上交易的"油费"

每笔链上交易都需要支付 Gas 费用给矿工/验证者：

```
Gas费 = Gas量 × Gas价格

Gas量：交易复杂度决定（简单转账 < 合约交互 < 复杂 DeFi）
Gas价格：网络拥堵程度决定（单位：Gwei，1 ETH = 10^9 Gwei）
```

**实际例子（Arbitrum）**：

| 操作 | 典型 Gas 费 |
|---|---|
| USDC 转账 | ~$0.01 |
| HyperLiquid 下单 | ~$0.05-0.20 |
| 复杂 DeFi 操作 | ~$0.50-2.00 |

> Arbitrum 是 Ethereum Layer 2，Gas 费比主网低 10-100x。这也是 D0 选择 Arbitrum 的原因之一。

**D0 如何处理 Gas**：D0 的 Turnkey 账户持有少量 ETH 用于支付 Gas。你不需要手动管理，但要确保账户有足够余额。

---

## D0 在这个基础上的位置

```
你的意图："买 0.1 ETH"
    ↓
D0 CLI（解析命令）
    ↓
Turnkey HSM（签名交易）
    ↓
Arbitrum（结算链）
    ↓
HyperLiquid（交易所）
    ↓
成交！
```

---

## 动手练习

```bash
# 1. 查看 ETH 实时价格
d0 price ETH

# 2. 搜索一个 Solana 代币
d0 search BONK

# 3. 查看整体账户状态
d0 balance
```

理解了这些基础，下一课我们进入价格分析——学会看 K 线和技术指标。

---

## 核心概念回顾

- **区块链**：不可篡改的分布式账本，交易确认后无法撤销
- **钱包**：私钥 + 公钥对，D0 使用 Turnkey 托管
- **代币标准**：ERC-20（ETH 链）、SPL（Solana 链）
- **Gas**：链上交易手续费，Arbitrum 上极低
