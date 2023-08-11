// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/**
 * @dev See documentation for exchange():
 * https://curve.readthedocs.io/registry-exchanges.html#swapping-tokens
 */
interface ICurveExchange {
    function exchange(
        address,
        address,
        address,
        uint256,
        uint256
    ) external returns (uint256);
}
