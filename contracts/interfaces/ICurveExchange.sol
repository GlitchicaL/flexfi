// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/**
 * @dev See documentation for exchange():
 * https://curve.readthedocs.io/registry-exchanges.html#swapping-tokens
 */
interface ICurveExchange {
    function exchange(
        address _pool,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _expected
    ) external payable returns (uint256);

    function get_best_rate(
        address _from,
        address _to,
        uint256 _amount
    ) external view returns (address, uint256);
}
