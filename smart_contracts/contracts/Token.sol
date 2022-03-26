// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./ERC777GovernedUpgradeable.sol";

/// @title A upgradeable governed ERC777-compliant contract.
/// @dev The governor address, which is the DAO's Wallet contract address, has the power to lock and forcefully transfer tokens.
///         On initialization, a speficic number of tokens are sent to a faucet contract.
contract Token is ERC777GovernedUpgradeable {
    address private _reserve;

    /// @dev Initialization of the Token contract before its use.
    /// @param name_ As per ERC777 standard.
    /// @param symbol_ As per ERC777 standard.
    /// @param defaultOperators_ As per ERC777 standard.
    /// @param totalSupply_ Total tokens to be minted.
    /// @param reserve_ The initially minted tokens destination address. This should be the DAO's wallet contract address.
    /// @param governor_ Who can govern this token. This should be DAO's wallet contract address.
    /// @param upgrader_ Who can upgrade this contract. This should  be the DAO's wallet contract address.
    /// @param faucet_ The faucet address.
    /// @param faucetInitialBalance_ The initial balance to transfer to the faucet.
    function initialize(
        string memory name_,
        string memory symbol_,
        address[] memory defaultOperators_,
        uint256 totalSupply_,
        address reserve_,
        address governor_,
        address upgrader_,
        address faucet_,
        uint256 faucetInitialBalance_
    ) external {
        __ERC777Governed_init(name_, symbol_, defaultOperators_, governor_, upgrader_);

        require(totalSupply_ > 0, "Total supply cannot be zero");
        require(reserve_ != address(0), "Reserve address cannot be zero");
        require(faucet_ != address(0), "Faucet address cannot be zero");
        require(faucetInitialBalance_ > 0, "Faucet initial balance cannot be zero");

        _reserve = reserve_;
        _mint(reserve_, totalSupply_, "", "", false);
        _move(governor_, reserve_, faucet_, faucetInitialBalance_, "", "");
    }

    function getReserve() external view returns (address) {
        return _reserve;
    }
}
