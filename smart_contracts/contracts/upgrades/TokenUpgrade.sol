// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "../Token.sol";

contract TokenUpgrade is Token {
    function additionalFunction(uint256 i) public pure returns (uint256) {
        return i;
    }
}
