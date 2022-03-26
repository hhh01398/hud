// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./IWallet.sol";
import "./IAssemblyCore.sol";

/// @title A contract that can, on behalf of the DAO, call any contract function, thus being able to e.g. store any asset and transfer it.
/// @dev The DAO collectively controls the Wallet contract. The Wallet contract can call any contract function through blockchain transactions. These transactions need to be first submitted to the Wallet contract in the form of transaction proposals. The DAO then approves (or not) the execution of the proposal through a voting. Any member of the DAO can submit transaction proposals unless the member has been distrusted.
contract Wallet is UUPSUpgradeable, ReentrancyGuardUpgradeable, IWallet {
    IAssemblyCore private _assembly;
    bool private _initialized;

    struct Proposal {
        address destination; // Receiver of the transaction.
        uint256 value; // Number of coins to transfer.
        bytes data; // The transaction function call data.
        bool executed; // Whether or not the transaction was executed.
    }

    uint256 private _proposalCount;
    mapping(uint256 => Proposal) private _proposals;

    //
    // Events
    //

    event Submitted(uint256 indexed proposalId); // A new transaction proposal was submitted.
    event Executed(uint256 indexed proposalId); // The proposed transaction was executed.
    event ExecutedFail(uint256 indexed proposalId); // The transaction could not be executed.
    event Deposited(address indexed sender, uint256 value); // Coins have been deposited into the Wallet.
    event Called(bool indexed result, bytes indexed resultMem); // The Wallet has performed an external call of a function.

    //
    // Modifiers
    //

    modifier onlyAssembly() {
        require(msg.sender == address(_assembly), "Only the Assembly can perform this operation");
        _;
    }

    modifier onlyMe() {
        require(msg.sender == address(this), "You are not allowed to do this");
        _;
    }

    modifier isInitialized() {
        require(address(_assembly) != address(0), "Contract has not yet been initialized");
        _;
    }

    modifier isExistingProposal(uint256 proposalId) {
        require(proposalId < _proposalCount, "Wrong proposal id");
        _;
    }

    modifier notYetExecuted(uint256 proposalId) {
        require(!_proposals[proposalId].executed, "Proposed transaction was already executed");
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

    function getAssembly() external view returns (address) {
        return address(_assembly);
    }

    function initialize(address assembly_) external {
        require(!_initialized, "Contract has already been initialized");
        require(assembly_ != address(0), "Assembly contract address cannot be zero");
        _assembly = IAssemblyCore(assembly_);
        _initialized = true;
    }

    function getProposal(uint256 id) external view isExistingProposal(id) returns (Proposal memory) {
        return _proposals[id];
    }

    /// @return Returns the number of proposals ever submitted.
    function getProposalCount() external view override returns (uint256) {
        return _proposalCount;
    }

    /// @dev Submit a transaction proposal. Only addresses allowed by the DAO can perform this operation.
    ///         Because this function can be abused in several ways, only trusted addresses can call it.
    /// @param destination The transaction destination.
    /// @param value The transaction value.
    /// @param data The transaction data.
    /// @return The new transaction's id.
    function submitProposal(
        address destination,
        uint256 value,
        bytes memory data
    ) external isInitialized returns (uint256) {
        if (!isTestMode()) require(_assembly.isTrusted(msg.sender), "You are not trusted to perform this operation");
        uint256 proposalId = _proposalCount;
        _proposals[proposalId] = Proposal({destination: destination, value: value, data: data, executed: false});
        _proposalCount += 1;
        emit Submitted(proposalId);
        return proposalId;
    }

    /// @dev Execute a submitted transaction. Only the operator can do this operation.
    /// @param proposalId The id of the proposal to execute.
    /// @return Whether the transaction was succesfully executed.
    function executeProposal(uint256 proposalId) external override isInitialized onlyAssembly isExistingProposal(proposalId) notYetExecuted(proposalId) nonReentrant returns (bool) {
        Proposal storage txn = _proposals[proposalId];
        if (externalCall(txn.destination, txn.value, txn.data)) {
            emit Executed(proposalId);
            txn.executed = true;
            return true;
        } else {
            emit ExecutedFail(proposalId);
            return false;
        }
    }

    function externalCall(
        address destination,
        uint256 value,
        bytes memory data
    ) internal returns (bool) {
        bool result;
        bytes memory resultMem;
        (result, resultMem) = destination.call{value: value}(data);
        emit Called(result, resultMem);
        return result;
    }

    /// @dev Emit an event when coins are received, regarless of msg.data
    fallback() external payable {
        if (msg.value > 0) emit Deposited(msg.sender, msg.value);
    }

    //
    // Upgrade
    //

    function _authorizeUpgrade(address newImplementation) internal override onlyMe {
        require(newImplementation != address(0), "New implementation contract address cannot be zero");
    }
}
