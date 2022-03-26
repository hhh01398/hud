// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract TestToken is ERC777 {
    constructor() ERC777("Test Token", "TEST", new address[](0)) {
        _mint(msg.sender, 10000 * 10**18, "", "");
    }
}
