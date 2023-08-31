// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/// @dev Interface Imports
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract ConvexExample {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}
