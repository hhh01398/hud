// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "../../ERC777GovernedUpgradeable.sol";

contract ERC777GovernedUpgradeableUpgrade is ERC777GovernedUpgradeable {
    function additionalFunction(uint256 i) public pure returns (uint256) {
        return i;
    }
}
