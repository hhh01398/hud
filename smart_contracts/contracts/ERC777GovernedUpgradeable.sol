// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./ERC777UpgradeableInternalBalance.sol";

contract ERC777GovernedUpgradeable is UUPSUpgradeable, ERC777UpgradeableInternalBalance {
    address private _governor;
    address private _upgrader;

    mapping(address => bool) private _blocked;

    event Blocked(address indexed account);
    event Unblocked(address indexed account);
    event GovernorSend(address indexed from, address indexed to, uint256 amount, bytes indexed userData);

    function __ERC777Governed_init(
        string memory name_,
        string memory symbol_,
        address[] memory defaultOperators_,
        address governor_,
        address upgrader_
    ) internal initializer {
        __ERC777_init(name_, symbol_, defaultOperators_);

        require(governor_ != address(0), "Governor address cannot be zero");
        require(upgrader_ != address(0), "Upgrader address cannot be zero");

        _governor = governor_;
        _upgrader = upgrader_;
    }

    modifier onlyUpgrader() {
        require(_upgrader == msg.sender, "You are not the upgrader");
        _;
    }

    modifier onlyGovernor() {
        require(_governor == msg.sender, "Only the governor can perform this operation");
        _;
    }

    function getGovernor() external view returns (address) {
        return _governor;
    }

    function getUpgrader() external view returns (address) {
        return _upgrader;
    }

    function blockAddress(address account) external onlyGovernor {
        require(_blocked[account] == false, "Address is blocked");
        _blocked[account] = true;
        emit Blocked(account);
    }

    function unblockAddress(address account) external onlyGovernor {
        require(_blocked[account] == true, "Address is not blocked");
        _blocked[account] = false;
        emit Unblocked(account);
    }

    function isBlocked(address account) external view returns (bool) {
        return _blocked[account];
    }

    function _move(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) internal override {
        require(_blocked[from] == false, "The sender address is blocked");
        require(_blocked[to] == false, "The recipient address is blocked");

        _moveWithoutBlocking(operator, from, to, amount, userData, operatorData);
    }

    function _moveWithoutBlocking(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) internal {
        _beforeTokenTransfer(operator, from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC777: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Sent(operator, from, to, amount, userData, operatorData);
        emit Transfer(from, to, amount);
    }

    function governorSend(
        address from,
        address to,
        uint256 amount,
        bytes memory userData
    ) external onlyGovernor {
        _moveWithoutBlocking(_governor, from, to, amount, userData, "");

        emit GovernorSend(from, to, amount, userData);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyUpgrader {
        require(newImplementation != address(0), "New implementation contract address cannot be zero");
    }
}
