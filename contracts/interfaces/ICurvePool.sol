// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/**
 * @dev See documentation for add_liquidity():
 * https://curve.readthedocs.io/factory-pools.html#adding-and-removing-liquidity
 */
interface ICurvePool {
    function add_liquidity(
        uint256[2] memory,
        uint256,
        address
    ) external returns (uint256);
}
