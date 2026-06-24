# Plugin and Config Recommendations

## Baseline Plugins

- `@nomicfoundation/hardhat-toolbox-mocha-ethers`: best for teams migrating existing Hardhat v2 + ethers projects.
- `@nomicfoundation/hardhat-toolbox-viem`: good greenfield default aligned with Hardhat v3 docs.
- `@nomicfoundation/hardhat-keystore`: store RPC URLs and private keys through Hardhat configuration variables.
- `@nomicfoundation/hardhat-verify`: contract verification when paired with Hedera-compatible verification endpoints.
- `@nomicfoundation/hardhat-typechain`: typed factories and HTS interfaces.
- `@nomicfoundation/hardhat-network-helpers`: mocked local HTS tests and local simulation helpers.

## Suggested Hedera Plugin Shape

A future `@hedera/hardhat-hedera` plugin should provide:

- predefined networks for mainnet, testnet, previewnet, and localnet,
- chain IDs `295`, `296`, and `297`,
- Hashio, local relay, self-hosted relay, and commercial relay presets,
- HTS/HAS/HSS system contract ABI exports,
- response-code decoding helpers,
- address/account ID/alias conversion helpers,
- HashScan/Sourcify verification integration,
- local test fixtures that mock `0x167`,
- tasks such as `hedera:decode-response`, `hedera:associate-token`, and `hedera:verify`.
