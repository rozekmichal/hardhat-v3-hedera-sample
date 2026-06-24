// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {IHederaTokenServiceLite} from "./hedera/IHederaTokenServiceLite.sol";

contract HtsTokenManager {
    address public constant HTS_SYSTEM_CONTRACT = address(0x167);

    IHederaTokenServiceLite private constant HTS =
        IHederaTokenServiceLite(HTS_SYSTEM_CONTRACT);

    address public immutable treasury;
    address public token;
    int64 public lastResponseCode;

    event TokenCreated(address indexed token, int64 responseCode);
    event TokenMinted(address indexed token, int64 amount, int64 newTotalSupply, int64 responseCode);
    event TokenBurned(address indexed token, int64 amount, int64 newTotalSupply, int64 responseCode);
    event HtsCallResult(string operation, int64 responseCode, address tokenAddress, int64 newTotalSupply);

    error TokenAlreadyCreated();
    error TokenNotCreated();
    error HtsResponse(string operation, int64 responseCode);

    int64 private constant HTS_SUCCESS = 22;
    uint private constant TOKEN_KEY_SUPPLY = 16;

    constructor(address initialTreasury) {
        treasury = initialTreasury;
    }

    receive() external payable {}

    function createSampleToken() external payable returns (address tokenAddress) {
        (int64 responseCode, address createdToken) = _createSampleToken();

        if (responseCode != HTS_SUCCESS) {
            revert HtsResponse("createFungibleToken", responseCode);
        }

        return createdToken;
    }

    function createSampleTokenUnchecked()
        external
        payable
        returns (int64 responseCode, address tokenAddress)
    {
        return _createSampleToken();
    }

    function _createSampleToken() internal returns (int64 responseCode, address tokenAddress) {
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

        (responseCode, tokenAddress) = HTS.createFungibleToken(
            hederaToken,
            1_000_000,
            8
        );

        lastResponseCode = responseCode;

        if (responseCode == HTS_SUCCESS) {
            token = tokenAddress;
            emit TokenCreated(tokenAddress, responseCode);
        }

        emit HtsCallResult("createFungibleToken", responseCode, tokenAddress, 0);
    }

    function mint(int64 amount) external returns (int64 newTotalSupply) {
        (int64 responseCode, int64 totalSupply) = _mint(amount);

        if (responseCode != HTS_SUCCESS) {
            revert HtsResponse("mintToken", responseCode);
        }

        return totalSupply;
    }

    function mintUnchecked(int64 amount)
        external
        returns (int64 responseCode, int64 newTotalSupply)
    {
        return _mint(amount);
    }

    function _mint(int64 amount) internal returns (int64 responseCode, int64 newTotalSupply) {
        if (token == address(0)) {
            revert TokenNotCreated();
        }

        int64[] memory serialNumbers;
        (responseCode, newTotalSupply, serialNumbers) = HTS.mintToken(token, amount, new bytes[](0));
        serialNumbers;

        lastResponseCode = responseCode;

        if (responseCode == HTS_SUCCESS) {
            emit TokenMinted(token, amount, newTotalSupply, responseCode);
        }

        emit HtsCallResult("mintToken", responseCode, token, newTotalSupply);
    }

    function burn(int64 amount) external returns (int64 newTotalSupply) {
        (int64 responseCode, int64 totalSupply) = _burn(amount);

        if (responseCode != HTS_SUCCESS) {
            revert HtsResponse("burnToken", responseCode);
        }

        return totalSupply;
    }

    function burnUnchecked(int64 amount)
        external
        returns (int64 responseCode, int64 newTotalSupply)
    {
        return _burn(amount);
    }

    function _burn(int64 amount) internal returns (int64 responseCode, int64 newTotalSupply) {
        if (token == address(0)) {
            revert TokenNotCreated();
        }

        (responseCode, newTotalSupply) = HTS.burnToken(token, amount, new int64[](0));

        lastResponseCode = responseCode;

        if (responseCode == HTS_SUCCESS) {
            emit TokenBurned(token, amount, newTotalSupply, responseCode);
        }

        emit HtsCallResult("burnToken", responseCode, token, newTotalSupply);
    }
}
