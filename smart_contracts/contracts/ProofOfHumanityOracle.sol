// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./IProofOfHumanity.sol";

/// @title Oracle of the Proof-of-Humanity contract on the Ethereum mainnet chain.
/// @dev The contract allows an updater address to register and deregister a large number of humans in one single transaction (i.e. in batches).
///         In the context of Humanity Unchained DAO, the updater is the Wallet contract address. This allows the DAO to update the oracle periodically by approving a batch update transaction proposal.
contract ProofOfHumanityOracle is UUPSUpgradeable, IProofOfHumanity {
    mapping(address => bool) private _isRegisteredHuman;
    uint256 private _submissionCount;
    uint256 private _humanCount;

    address private _updater; // The DAO's wallet contract, thus allowing the DAO to update the oracle through a voting.
    address private _upgrader;

    bool private _initialized;
    uint256 private _lastUpdateTimestamp;

    //
    // Events
    //

    event Update();

    //
    // Modifiers
    //

    modifier isInitialized() {
        require(_initialized, "Contract has not yet been initialized");
        _;
    }

    /// @dev Allow anyone to register/deregister humans before initialization.
    modifier onlyUpdater() {
        require(msg.sender == _updater || _updater == address(0) || isTestMode(), "You are not the updater");
        _;
    }

    modifier onlyUpgrader() {
        require(msg.sender == _upgrader, "You are not the upgrader");
        _;
    }

    //
    // Test functions (to be overriden for testing purposes only).
    //

    function isTestMode() public view virtual returns (bool) {
        return false;
    }

    function setTestMode(bool testMode) external virtual {}

    //
    // Functions
    //

    function getUpdater() external view returns (address) {
        return _updater;
    }

    function getUpgrader() external view returns (address) {
        return _upgrader;
    }

    function getHumanCount() external view returns (uint256) {
        return _humanCount;
    }

    function getLastUpdateTimestamp() external view returns (uint256) {
        return _lastUpdateTimestamp;
    }

    /// @dev Initialization of the contract.
    /// @param updater Only the updater can register or deregister.
    /// @param upgrader Only the upgrader address can upgrade de contract.
    function initialize(address updater, address upgrader) external {
        require(!_initialized, "Contract has already been initialized");
        require(updater != address(0), "Updater address cannot be zero");
        require(upgrader != address(0), "Upgrader address cannot be zero");

        _updater = updater;
        _upgrader = upgrader;

        _initialized = true;
    }

    /// @param account The address of the human.
    /// @return Whether or not the adddress belongs to a human who has succesfully proved that he or she is a human.
    function isRegistered(address account) external view override returns (bool) {
        return _isRegisteredHuman[account];
    }

    function submissionCounter() external view override returns (uint256) {
        return _submissionCount;
    }

    function setSubmissionCounter(uint256 newSubmissionCount) external onlyUpdater {
        require(_submissionCount != newSubmissionCount, "The new parameter value must be different");
        _submissionCount = newSubmissionCount;
        _lastUpdateTimestamp = block.timestamp;
        emit Update();
    }

    function registerHuman(address account) external onlyUpdater {
        _isRegisteredHuman[account] = true;
        _humanCount++;
        _lastUpdateTimestamp = block.timestamp;
        emit Update();
    }

    function deregisterHuman(address account) external onlyUpdater {
        _isRegisteredHuman[account] = false;
        _humanCount--;
        _lastUpdateTimestamp = block.timestamp;
        emit Update();
    }

    function registerHumans(address[] memory addresses) external onlyUpdater {
        for (uint256 i = 0; i < addresses.length; i++) _isRegisteredHuman[addresses[i]] = true;

        _humanCount += addresses.length;
        _lastUpdateTimestamp = block.timestamp;
        emit Update();
    }

    function deregisterHumans(address[] memory addresses) external onlyUpdater {
        for (uint256 i = 0; i < addresses.length; i++) _isRegisteredHuman[addresses[i]] = false;

        _humanCount -= addresses.length;
        _lastUpdateTimestamp = block.timestamp;
        emit Update();
    }

    //
    // Upgrade
    //

    function _authorizeUpgrade(address newImplementation) internal override isInitialized onlyUpgrader {
        require(newImplementation != address(0), "New implementation contract address cannot be zero");
    }
}
