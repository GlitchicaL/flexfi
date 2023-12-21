// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {INotional} from "./interfaces/INotional.sol";

contract NotionalExample {
    constructor() {}

    function deposit() public {
        INotional.BalanceActionWithTrades[]
            memory actions = new INotional.BalanceActionWithTrades[](1);

        actions[0] = INotional.BalanceActionWithTrades({
            actionType: INotional
                .DepositActionType
                .DepositUnderlyingAndMintNToken, // Deposit ETH, not cETH
            currencyId: 2, // DAI
            depositActionAmount: 10000000000000000000,
            withdrawAmountInternalPrecision: 0,
            withdrawEntireCashBalance: false,
            redeemToUnderlying: false,
            trades: new bytes32[](0) // no trades, just depositing
        });

        IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).approve(
            0x1344A36A1B56144C3Bc62E7757377D288fDE0369,
            10000000000000000000
        );

        INotional(0x1344A36A1B56144C3Bc62E7757377D288fDE0369)
            .batchBalanceAndTradeAction(address(this), actions);
    }

    function borrow() public {
        INotional.BalanceActionWithTrades[]
            memory actions = new INotional.BalanceActionWithTrades[](1);

        actions[0] = INotional.BalanceActionWithTrades({
            actionType: INotional.DepositActionType.None,
            currencyId: 2, // DAI
            depositActionAmount: 0,
            withdrawAmountInternalPrecision: 0,
            withdrawEntireCashBalance: true, // Will withdraw all the borrowed DAI
            redeemToUnderlying: true, // Converts to DAI from cDAI
            trades: new bytes32[](1)
        });

        actions[0].trades[0] = encodeBorrowTrade(
            3, // Borrow from marketIndex 3, 1 year tenor
            1e8, // Sell 100 fCash, equivalent to paying 100e18 DAI at maturity
            0.06e9 // Do not borrow at a higher rate than 8% annualized
        );

        INotional(0x1344A36A1B56144C3Bc62E7757377D288fDE0369)
            .batchBalanceAndTradeAction(address(this), actions);
    }

    function redeem() public {
        INotional.BalanceActionWithTrades[]
            memory actions = new INotional.BalanceActionWithTrades[](1);

        actions[0] = INotional.BalanceActionWithTrades({
            actionType: INotional.DepositActionType.RedeemNToken,
            currencyId: 2, // DAI
            depositActionAmount: IERC20(
                0x6EbcE2453398af200c688C7c4eBD479171231818
            ).balanceOf(address(this)),
            withdrawAmountInternalPrecision: 0,
            withdrawEntireCashBalance: true, // Will withdraw all the borrowed DAI
            redeemToUnderlying: true, // Converts to DAI from cDAI
            trades: new bytes32[](0)
        });

        INotional(0x1344A36A1B56144C3Bc62E7757377D288fDE0369)
            .batchBalanceAndTradeAction(address(this), actions);
    }

    function supply() public {
        IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).approve(
            0x1344A36A1B56144C3Bc62E7757377D288fDE0369,
            1000000000000000000
        );

        INotional(0x1344A36A1B56144C3Bc62E7757377D288fDE0369)
            .depositUnderlyingToken(address(this), 2, 1000000000000000000);
    }

    function getBalance() public view returns (int256, int256, uint256) {
        (
            int256 cashBalance,
            int256 nTokenBalance,
            uint256 lastClaimTime
        ) = INotional(0x1344A36A1B56144C3Bc62E7757377D288fDE0369)
                .getAccountBalance(2, address(this));

        return (cashBalance, nTokenBalance, lastClaimTime);
    }

    function getCollateralView() public view returns (int256, int256[] memory) {
        (int256 n1, int256[] memory n2) = INotional(
            0x1344A36A1B56144C3Bc62E7757377D288fDE0369
        ).getFreeCollateral(address(this));
        return (n1, n2);
    }

    function encodeBorrowTrade(
        uint8 marketIndex,
        uint88 fCashAmount,
        uint32 maxImpliedRate
    ) internal pure returns (bytes32) {
        return
            bytes32(
                (uint256(uint8(INotional.TradeActionType.Borrow)) << 248) |
                    (uint256(marketIndex) << 240) |
                    (uint256(fCashAmount) << 152) |
                    (uint256(maxImpliedRate) << 120)
            );
    }
}
