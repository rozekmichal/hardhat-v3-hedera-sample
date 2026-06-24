# Compatibility Notes

## Hardhat-Specific

- Hardhat v3 compiles and deploys standard Solidity contracts to Hedera through HTTP JSON-RPC.
- Use `build` in v3 workflows, although `compile` may still work.
- Use `network.create()` in scripts. `network.connect()` is deprecated in the installed Hardhat v3 version.
- This lab intentionally keeps only `hederaTestnet` configured for live network testing.

## Hedera/Relay-Specific

- Public Hashio endpoints are for development and testing.
- HBAR decimal representation can differ between HAPI/native concepts and relay/EVM-facing values.
- ED25519 accounts are Hedera-native and require Hedera-specific signature handling; ECDSA accounts are smoother with EVM tooling.
- HTS operations depend on key authority and token association state.
- Hardhat's simulated EDR network does not implement Hedera services such as HTS by default.
- Historical state workflows should use mirror-node APIs when exact Hedera history matters.
