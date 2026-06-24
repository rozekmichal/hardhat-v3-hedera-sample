# Hardhat v3 + Hedera Sample

This sample demonstrates a Hardhat v3 project for Hedera with:

- a standard ERC-20 deployment path,
- an HTS-facing Solidity contract that calls the `0x167` system contract,
- local mocked tests for HTS behavior,
- Hedera testnet configuration,
- evidence-producing scripts for manual compatibility testing.

## Install

```bash
npm install
```

Hardhat v3 requires a current Node.js runtime. The official docs currently list Node.js `v22.13.0` or later.

## Configure Secrets

For this lab, create a local `.env` file from the committed template:

```bash
cp .env.example .env
```

Then set:

```bash
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_PRIVATE_KEY=0x...
HEDERA_HTS_CREATE_TOKEN_GAS_LIMIT=15000000
HEDERA_HTS_CREATE_TOKEN_GAS_PRICE_WEIBAR=10000000000000
HEDERA_HTS_MANAGER_FUNDING_HBAR=20
```

The local Hardhat config loads `.env` directly, but `.env` is ignored by Git.
Do not commit private keys.
`HEDERA_HTS_CREATE_TOKEN_GAS_LIMIT` controls the max fee budget for the HTS token creation system-contract call.
`HEDERA_HTS_CREATE_TOKEN_GAS_PRICE_WEIBAR` sets an explicit gas price for the HTS token creation call.
`HEDERA_HTS_MANAGER_FUNDING_HBAR` funds the deployed HTS manager before it calls the HTS system contract.

You can also store the same values with the Hardhat v3 keystore:

```bash
npx hardhat keystore set HEDERA_TESTNET_RPC_URL
npx hardhat keystore set HEDERA_TESTNET_PRIVATE_KEY
```

## Build and Test

```bash
npm run build
npm test
```

The HTS unit test mocks the Hedera `0x167` system contract on the local simulated network. This proves Hardhat compilation and test flow, but it is not a substitute for integration tests on Hedera testnet.

## Manual Testnet Evidence Flows

```bash
npm run diagnose:relay
npm run flow:erc
npm run flow:hts
```

Each flow writes a JSON evidence file into `results/`.
These files are the primary raw material for the compatibility report.

Recommended order:

1. `npm run build`
2. `npm test`
3. `npm run diagnose:relay`
4. `npm run flow:erc`
5. `npm run flow:hts`

## Simple Deploy Scripts

```bash
npm run deploy:erc
npm run deploy:hts
```

The deploy scripts are useful for quick manual exploration.
The `flow:*` scripts are better for the report because they also save receipts, addresses, and errors.

## Smoke Test Relay Connectivity

```bash
npm run smoke:hedera
```

## Notes

- Use ECDSA Hedera accounts for EVM tooling compatibility.
- Hashio endpoints are suitable for development and testing, not production.
- For production, use a commercial relay or self-host the Hiero JSON-RPC relay.
- Keep ERC tests, mocked HTS tests, and live Hedera integration tests separate so failures are easy to attribute.
- HTS live calls may fail for Hedera permission, association, fee, or relay reasons. A failed `flow:hts` run is still useful evidence if the error is captured in `results/`.
