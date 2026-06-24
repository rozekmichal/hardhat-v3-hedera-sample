// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SampleERC20 is ERC20 {
    constructor(address initialHolder) ERC20("Hardhat Hedera Sample", "HHS") {
        _mint(initialHolder, 1_000_000 * 10 ** decimals());
    }
}
