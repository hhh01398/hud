// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";

/// @title A recipient to store DAO's tokens and spend them automatically without the need for a voting.
/// @dev This contract is intended to store a *small* number of tokens. The tokens are used to pay for delegation, tally counting, execution of approved transactions and referral rewards. The DAO periodically refills this contract with more tokens through a voting as needed.
contract Faucet is UUPSUpgradeable {
    IERC777 private _token;
    address private _assembly;
    address private _wallet;
    address private _upgrader;
    bool private _initialized;

    /// modifiers

    modifier onlyAssemblyOrWallet() {
        require(msg.sender == _assembly || msg.sender == _wallet, "You are not allowed to do this");
        _;
    }

    modifier onlyUpgrader() {
        require(msg.sender == _upgrader, "You are not the upgrader");
        _;
    }

    /// getters

    modifier isInitialized() {
        require(_initialized, "Contract has not yet been initialized");
        _;
    }

    function getAssembly() external view returns (address) {
        return _assembly;
    }

    function getWallet() external view returns (address) {
        return _wallet;
    }

    function getToken() external view returns (address) {
        return address(_token);
    }

    function getUpgrader() external view returns (address) {
        return _upgrader;
    }

    /// @dev The contract must be initialized before use.
    /// @param assembly_ The address of the Assembly contract.
    /// @param wallet The address of the Wallet contract.
    /// @param token The address of the Token contract.
    /// @param upgrader The address of the upgrader, which should be the Wallet contract address.
    function initialize(
        address assembly_,
        address wallet,
        address token,
        address upgrader
    ) external {
        require(!_initialized, "Contract has already been initialized");
        require(assembly_ != address(0), "Assembly contract address cannot be zero");
        require(wallet != address(0), "Wallet contract address cannot be zero");
        require(token != address(0), "Token contract address cannot be zero");
        require(upgrader != address(0), "Upgrader address cannot be zero");

        _token = IERC777(token);
        _assembly = assembly_;
        _wallet = wallet;
        _upgrader = upgrader;
        _initialized = true;
    }

    /// @dev Send tokens from this contract to a recipient address with attached data. This function can be called only by the Assembly or the Wallet contracts.
    /// @param recipient The recipient of the tokens.
    /// @param amount The number of tokens.
    /// @param data The data attached to the transaction.
    function send(
        address recipient,
        uint256 amount,
        bytes calldata data
    ) external isInitialized onlyAssemblyOrWallet {
        _token.send(recipient, amount, data);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyUpgrader {
        require(newImplementation != address(0), "New implementation contract address cannot be zero");
    }
}
