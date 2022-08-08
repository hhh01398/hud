// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "../../Faucet.sol";

contract FaucetUpgrade is Faucet {
    function additionalFunction(uint256 i) public pure returns (uint256) {
        return i;
    }
}
