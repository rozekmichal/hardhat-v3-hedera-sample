// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {IHederaTokenServiceLite} from "./hedera/IHederaTokenServiceLite.sol";

contract HtsTokenManager {
    address public constant HTS_SYSTEM_CONTRACT = address(0x167);

    IHederaTokenServiceLite private constant HTS =
        IHederaTokenServiceLite(HTS_SYSTEM_CONTRACT);

    address public immutable treasury;
    address public token;

    event TokenCreated(address indexed token, int64 responseCode);
    event TokenMinted(address indexed token, int64 amount, int64 newTotalSupply, int64 responseCode);
    event TokenBurned(address indexed token, int64 amount, int64 newTotalSupply, int64 responseCode);

    error TokenAlreadyCreated();
    error TokenNotCreated();
    error HtsResponse(string operation, int64 responseCode);

    int64 private constant HTS_SUCCESS = 22;
    uint private constant TOKEN_KEY_SUPPLY = 16;

    constructor(address initialTreasury) {
        treasury = initialTreasury;
    }

    function createSampleToken() external payable returns (address tokenAddress) {
        if (token != address(0)) {
            revert TokenAlreadyCreated();
        }

        IHederaTokenServiceLite.TokenKey[] memory tokenKeys =
            new IHederaTokenServiceLite.TokenKey[](1);
        tokenKeys[0] = IHederaTokenServiceLite.TokenKey({
            keyType: TOKEN_KEY_SUPPLY,
            key: IHederaTokenServiceLite.KeyValue({
                inheritAccountKey: false,
                contractId: address(this),
                ed25519: "",
                ECDSA_secp256k1: "",
                delegatableContractId: address(0)
            })
        });

        IHederaTokenServiceLite.HederaToken memory hederaToken =
            IHederaTokenServiceLite.HederaToken({
                name: "Hardhat HTS Sample",
                symbol: "HHTS",
                treasury: treasury,
                memo: "Hardhat v3 Hedera HTS compatibility test",
                tokenSupplyType: false,
                maxSupply: 0,
                freezeDefault: false,
                tokenKeys: tokenKeys,
                expiry: IHederaTokenServiceLite.Expiry({
                    second: 0,
                    autoRenewAccount: address(0),
                    autoRenewPeriod: 0
                })
            });

        int64 responseCode;
        (responseCode, tokenAddress) = HTS.createFungibleToken{value: msg.value}(
            hederaToken,
            1_000_000,
            8
        );

        if (responseCode != HTS_SUCCESS) {
            revert HtsResponse("createFungibleToken", responseCode);
        }

        token = tokenAddress;
        emit TokenCreated(tokenAddress, responseCode);
    }

    function mint(int64 amount) external returns (int64 newTotalSupply) {
        if (token == address(0)) {
            revert TokenNotCreated();
        }

        int64 responseCode;
        int64[] memory serialNumbers;
        (responseCode, newTotalSupply, serialNumbers) = HTS.mintToken(token, amount, new bytes[](0));
        serialNumbers;

        if (responseCode != HTS_SUCCESS) {
            revert HtsResponse("mintToken", responseCode);
        }

        emit TokenMinted(token, amount, newTotalSupply, responseCode);
    }

    function burn(int64 amount) external returns (int64 newTotalSupply) {
        if (token == address(0)) {
            revert TokenNotCreated();
        }

        int64 responseCode;
        (responseCode, newTotalSupply) = HTS.burnToken(token, amount, new int64[](0));

        if (responseCode != HTS_SUCCESS) {
            revert HtsResponse("burnToken", responseCode);
        }

        emit TokenBurned(token, amount, newTotalSupply, responseCode);
    }
}
