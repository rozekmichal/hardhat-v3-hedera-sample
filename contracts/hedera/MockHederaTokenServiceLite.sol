// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {IHederaTokenServiceLite} from "./IHederaTokenServiceLite.sol";

contract MockHederaTokenServiceLite is IHederaTokenServiceLite {
    int64 private constant HTS_SUCCESS = 22;

    address public nextToken = address(0x1234);
    int64 public totalSupply;

    event MockTokenCreated(address indexed treasury, address indexed token);

    function setNextToken(address token) external {
        nextToken = token;
    }

    function createFungibleToken(
        HederaToken memory token,
        int64 initialTotalSupply,
        int32
    ) external payable returns (int64 responseCode, address tokenAddress) {
        totalSupply = initialTotalSupply;
        tokenAddress = nextToken;
        emit MockTokenCreated(token.treasury, tokenAddress);
        responseCode = HTS_SUCCESS;
    }

    function mintToken(address, int64 amount, bytes[] calldata)
        external
        returns (
            int64 responseCode,
            int64 newTotalSupply,
            int64[] memory serialNumbers
        )
    {
        totalSupply += amount;
        return (HTS_SUCCESS, totalSupply, serialNumbers);
    }

    function burnToken(address, int64 amount, int64[] calldata)
        external
        returns (int64 responseCode, int64 newTotalSupply)
    {
        totalSupply -= amount;
        return (HTS_SUCCESS, totalSupply);
    }
}
