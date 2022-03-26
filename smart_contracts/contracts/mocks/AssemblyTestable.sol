// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "../Assembly.sol";

contract AssemblyTestable is Assembly {
    bool private _testMode = false;

    function setTestMode(bool testMode) external override {
        _testMode = testMode;
    }

    function isTestMode() public view override returns (bool) {
        return _testMode;
    }
}
