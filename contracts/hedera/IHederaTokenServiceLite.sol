// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

interface IHederaTokenServiceLite {
    struct Expiry {
        int64 second;
        address autoRenewAccount;
        int64 autoRenewPeriod;
    }

    struct KeyValue {
        bool inheritAccountKey;
        address contractId;
        bytes ed25519;
        bytes ECDSA_secp256k1;
        address delegatableContractId;
    }

    struct TokenKey {
        uint keyType;
        KeyValue key;
    }

    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool tokenSupplyType;
        int64 maxSupply;
        bool freezeDefault;
        TokenKey[] tokenKeys;
        Expiry expiry;
    }

    function createFungibleToken(
        HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) external payable returns (int64 responseCode, address tokenAddress);

    function mintToken(address token, int64 amount, bytes[] calldata metadata)
        external
        returns (
            int64 responseCode,
            int64 newTotalSupply,
            int64[] memory serialNumbers
        );

    function burnToken(address token, int64 amount, int64[] calldata serialNumbers)
        external
        returns (int64 responseCode, int64 newTotalSupply);
}
