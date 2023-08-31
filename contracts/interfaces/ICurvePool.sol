// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/**
 * @dev See documentation for add_liquidity():
 * https://curve.readthedocs.io/factory-pools.html#adding-and-removing-liquidity
 */
interface ICurvePool {
    function add_liquidity(
        uint256[2] memory amounts, // <-- 2 Tokens
        uint256 min_mint_amount
    ) external returns (uint256);

    function add_liquidity(
        uint256[3] memory amounts, // <-- 3 Tokens
        uint256 min_mint_amount
    ) external returns (uint256);

    function token() external view returns (address);
}
