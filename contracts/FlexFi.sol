// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/// @dev Interface Imports
import {ICurveExchange} from "./interfaces/ICurveExchange.sol";
import {ICurvePool} from "./interfaces/ICurvePool.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract FlexFi {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}
