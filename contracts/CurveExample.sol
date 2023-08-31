// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/// @dev Interface Imports
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICurveExchange} from "./interfaces/ICurveExchange.sol";
import {ICurvePool} from "./interfaces/ICurvePool.sol";

/// @dev Custom Interfaces
interface IWETH {
    function deposit() external payable;
}

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CurveExample {
    address constant CURVE_EXCHANGE =
        0x99a58482BD75cbab83b27EC03CA68fF489b5788f;

    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Perform a swap on Curve Finance
     * @param _pool Address of pool to approve & swap
     * @param _path Array of 2 addresses representing tokens to swap
     * @param _amount Number of _path[0] to swap
     * @param _expected Number of _path[1] expected to be given
     */
    function swapOnCurve(
        address _pool,
        address[2] memory _path,
        uint256 _amount,
        uint256 _expected
    ) public payable {
        if (msg.value == 0) {
            IERC20(_path[0]).approve(CURVE_EXCHANGE, _amount);

            ICurveExchange(CURVE_EXCHANGE).exchange(
                _pool,
                _path[0],
                _path[1],
                _amount,
                _expected
            );
        } else {
            ICurveExchange(CURVE_EXCHANGE).exchange{value: msg.value}(
                _pool,
                _path[0],
                _path[1],
                _amount,
                _expected
            );
        }
    }

    /**
     * @dev Add liquidity to a Curve Finance pool of 2 tokens
     * @param _tokens Array of 2 Addresses representing tokens in the pool
     * @param _amounts Array of 2 Numbers representing tokens to deposit
     * @param _pool Address of the Pool
     * @param _expected Amount of LP tokens expected to be given
     */
    function addLiquidityToCurve(
        address[2] memory _tokens,
        uint256[2] memory _amounts,
        address _pool,
        uint256 _expected
    ) public {
        require(
            _tokens.length == _amounts.length,
            "CurveExample: Invalid tokens & amounts length"
        );

        for (uint256 i = 0; i < _tokens.length; i++) {
            IERC20(_tokens[i]).approve(_pool, _amounts[i]);
        }

        ICurvePool(_pool).add_liquidity(_amounts, _expected);
    }

    /// @dev Public Helper Functions

    function getWETH() public payable {
        IWETH(WETH).deposit{value: msg.value}();
    }

    /// @dev Public View Functions

    /**
     * @dev Find the best pool for swapping tokens
     * @param _path Array of token addresses to be swapped
     * @param _amount Amount of token X to swap for token Y
     */
    function getBestPool(
        address[2] memory _path,
        uint256 _amount
    ) public view returns (address) {
        (address pool, ) = ICurveExchange(CURVE_EXCHANGE).get_best_rate(
            _path[0],
            _path[1],
            _amount
        );

        return pool;
    }

    /**
     * @dev Find the LP token address of a pool
     * @param _pool Address of the pool
     */
    function getLPAddress(address _pool) public view returns (address) {
        return ICurvePool(_pool).token();
    }
}
