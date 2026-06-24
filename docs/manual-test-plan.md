# Manual Test Plan

This repo is a Hardhat v3 compatibility lab for Hedera testnet.
Run each step and keep the generated `results/*.json` files.

## 1. Local Hardhat Checks

```bash
npm run build
npm test
```

Purpose:

- confirms Hardhat v3 compilation,
- confirms artifact generation,
- confirms local ERC testing,
- confirms local HTS-facing code can be tested only with a mocked `0x167`.

## 2. Relay Diagnostics

```bash
npm run diagnose:relay
```

Purpose:

- confirms the configured Hedera JSON-RPC relay is reachable,
- records chain ID,
- records signer address and balance,
- records latest block metadata.

## 3. ERC Testnet Flow

```bash
npm run flow:erc
```

Purpose:

- deploys `SampleERC20` to Hedera testnet,
- reads ERC metadata and balances,
- sends a simple ERC write transaction,
- records deployment and transaction receipts.

## 4. HTS Testnet Flow

```bash
npm run flow:hts
```

Purpose:

- deploys `HtsTokenManager` to Hedera testnet,
- calls `createSampleToken()` through `0x167`,
- attempts a mint through the manager,
- records success receipts or the exact relay/HTS error.

## Interpretation Rules

- A local HTS mock passing does not prove live HTS compatibility.
- A failed live HTS call may still prove Hardhat compatibility if deployment and transaction submission work and the failure is a Hedera service or relay error.
- Keep Hardhat failures, relay failures, and Hedera HTS semantic failures in separate notes.
