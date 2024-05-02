// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IRewardsDistributor} from "@aave/periphery-v3/contracts/rewards/interfaces/IRewardsDistributor.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AaveExample {
    address public constant WETH_ADDRESS =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC_ADDRESS =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    address public constant AAVE_POOL_ADDRESS =
        0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2;
    address public constant AAVE_REWARDS_ADDRESS =
        0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb;
    address public constant AAVE_WETH =
        0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    /**
     * Supply WETH to Aave
     * @param _amount Amount of WETH to supply
     */
    function supplyAave(uint256 _amount) public {
        IERC20(WETH_ADDRESS).approve(AAVE_POOL_ADDRESS, _amount);
        IPool(AAVE_POOL_ADDRESS).supply(
            WETH_ADDRESS,
            _amount,
            address(this),
            0
        );
    }

    /**
     *
     * @param _amount Amount of WETH to withdraw
     */
    function withdrawAave(uint256 _amount) public {
        IPool(AAVE_POOL_ADDRESS).withdraw(WETH_ADDRESS, _amount, address(this));
    }

    /**
     * Borrow USDC from Aave
     * @param _amount Amount of USDC to borrow
     */
    function borrowAave(uint256 _amount) public {
        /// @dev 2 for debt type, 0 for referral, address(this) for the contract to incur debt
        IPool(AAVE_POOL_ADDRESS).borrow(
            USDC_ADDRESS,
            _amount,
            2,
            0,
            address(this)
        );
    }

    function repayAave(address _token, uint256 _amount) public {
        // IPool(AAVE_POOl_ADDRESS).repay(_token, _amount, uint256 rateMode, address onBehalfOf)
    }

    // --- PUBLIC VIEW FUNCTIONS --- //

    function getTokenBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function getRewardsInfoForToken(
        address _token
    ) public view returns (address[] memory) {
        return
            IRewardsDistributor(AAVE_REWARDS_ADDRESS).getRewardsByAsset(_token);
    }

    function getRewardsInfoForContract(
        address[] calldata _tokens
    ) public view returns (address[] memory, uint256[] memory) {
        return
            IRewardsDistributor(AAVE_REWARDS_ADDRESS).getAllUserRewards(
                _tokens,
                address(this)
            );
    }
}
