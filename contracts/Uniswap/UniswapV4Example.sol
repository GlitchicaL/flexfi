// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {
    Commands
} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";

// UNISWAP V4 ROUTER
import {PoolKey} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IV4Router} from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniversalRouter {
    function execute(
        bytes calldata commands,
        bytes[] calldata inputs,
        uint256 deadline
    ) external;
}

interface Permit2 {
    function approve(address, address, uint160, uint48) external;
}

/// @dev Custom Interfaces
interface IWETH {
    function deposit() external payable;
}

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UniswapV4Example {
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    address public constant permit2 =
        0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address public constant router = 0x66a9893cC07D91D95644AEDD05D03f95e1dBA8Af;

    constructor() {}

    function approveTokenWithPermit2(address token, uint160 amount) external {
        IERC20(token).approve(address(permit2), type(uint256).max);
        Permit2(permit2).approve(token, router, amount, type(uint48).max);
    }

    function executeTrade(
        PoolKey calldata key,
        uint128 amountIn,
        uint128 minAmountOut
    ) external {
        bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP));

        // Encode V4Router actions
        bytes memory actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );

        bytes[] memory params = new bytes[](3);

        // First parameter: swap configuration
        params[0] = abi.encode(
            IV4Router.ExactInputSingleParams({
                poolKey: key,
                zeroForOne: false, // true if we're swapping token0 for token1
                amountIn: amountIn, // amount of tokens we're swapping
                amountOutMinimum: 0, // minimum amount we expect to receive
                hookData: bytes("") // no hook data needed
            })
        );

        // Second parameter: specify input tokens for the swap
        // encode SETTLE_ALL parameters
        params[1] = abi.encode(WETH, amountIn);

        // Third parameter: specify output tokens from the swap
        params[2] = abi.encode(USDC, 0);

        bytes[] memory inputs = new bytes[](1);

        // Combine actions and params into inputs
        inputs[0] = abi.encode(actions, params);

        IERC20(WETH).approve(router, type(uint256).max);

        // Execute the swap
        IUniversalRouter(router).execute(
            commands,
            inputs,
            block.timestamp + 20
        );

        uint256 amountOut = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)
            .balanceOf(address(this));
        require(
            amountOut >= minAmountOut,
            "Arbitrage: Insufficient output amount"
        );
    }

    function getBalance(
        address token,
        address user
    ) public view returns (uint256 balance) {
        return IERC20(token).balanceOf(user);
    }

    function getWETH() public payable {
        IWETH(WETH).deposit{value: msg.value}();
    }
}
