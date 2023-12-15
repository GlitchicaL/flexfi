// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

/// @dev Interface Imports
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IConvex {
    /// @dev deposit into convex, receive a tokenized deposit. Parameter to stake immediately.
    function deposit(
        uint256 _pid,
        uint256 _amount,
        bool _stake
    ) external returns (bool);

    /// @dev burn a tokenized deposit to receive curve lp tokens back
    function withdraw(uint256 _pid, uint256 _amount) external returns (bool);
}

contract ConvexExample {
    constructor() {}

    function depositCRV(uint256 _amount) external {
        IERC20(0x971add32Ea87f10bD192671630be3BE8A11b8623).approve(
            0xF403C135812408BFbE8713b5A23a04b3D48AAE31,
            _amount
        );

        IConvex(0xF403C135812408BFbE8713b5A23a04b3D48AAE31).deposit(
            157,
            _amount,
            true
        );
    }
}
