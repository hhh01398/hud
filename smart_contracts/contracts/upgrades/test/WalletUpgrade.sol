// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "../../mocks/WalletTestable.sol";

contract WalletUpgrade is WalletTestable {
    function additionalFunction(uint256 i) public pure returns (uint256) {
        return i;
    }
}
