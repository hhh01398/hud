// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "../../mocks/ProofOfHumanityOracleTestable.sol";

contract ProofOfHumanityOracleUpgrade is ProofOfHumanityOracleTestable {
    function additionalFunction(uint256 i) public pure returns (uint256) {
        return i;
    }
}
