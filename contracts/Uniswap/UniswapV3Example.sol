// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/**
 * @dev Uniswap V3 Documentation
 * https://docs.uniswap.org/contracts/v3/guides/swaps/single-swaps
 */

/// @dev Interface Imports
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Custom Interfaces
interface IWETH {
    function deposit() external payable;
}

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UniswapV3Example {
    /// @notice Currently using SwapRouter01
    address constant SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function swap(
        address[] memory _path,
        uint24 _fee,
        uint256 _amountIn
    ) public {
        require(
            IERC20(_path[0]).approve(SWAP_ROUTER, _amountIn),
            "UniswapV3Example: Approval Failed"
        );

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _path[0],
                tokenOut: _path[1],
                fee: _fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        ISwapRouter(SWAP_ROUTER).exactInputSingle(params);
    }

    /// @dev Public Helper Functions

    function getWETH() public payable {
        IWETH(WETH).deposit{value: msg.value}();
    }

    function withdrawETH() public {
        require(msg.sender == owner);
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

    function withdrawTokens(address _token) public {
        require(msg.sender == owner);
        require(
            IERC20(_token).transfer(
                owner,
                IERC20(_token).balanceOf(address(this))
            )
        );
    }
}
