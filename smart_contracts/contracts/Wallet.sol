// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./IWallet.sol";
import "./IAssemblyCore.sol";

/// @title A contract that can, on behalf of the DAO, call any contract function, thus being able to e.g. store any asset and transfer it.
/// @dev The DAO collectively controls the Wallet contract through democratic voting. The Wallet contract can store in and transfer out coins, as well as call any contract function, through blockchain transactions. These transactions need to be first submitted to the Wallet contract and bundled in a proposal. Proposals can contain multiple transactions, which can be executed either in the same chain block, in different blocks or in a combination of both methods by allocating the transactions to execution buckets or steps. When the DAO approves the execution of a proposal, the proposal's transactions are executed sequentially, that is, one step after another. Any member of the DAO can submit transactions and proposals unless the member has been distrusted.
contract Wallet is UUPSUpgradeable, ReentrancyGuardUpgradeable, IWallet {
    IAssemblyCore private _assembly;
    bool private _initialized;

    struct Transaction {
        address destination; // Receiver of the transaction.
        uint256 value; // Number of coins to transfer.
        bytes data; // The transaction function call data.
        bool executed; // Whether or not the transaction was executed.
    }

    uint256 private _transactionCount;
    mapping(uint256 => Transaction) private _transactions;

    struct Proposal {
        address creator; // The creator of the proposal
        ProposalStatus status; // Status of the proposal.
        uint256 executedSteps; // Number of fully executed steps.
        uint256[][] transactionIds; // The ids of the proposal's transactions sorted in steps. E.g. transactionIds[1][2] is the id of the 3rd transaction of the 2nd step.
    }

    uint256 private _proposalCount;
    mapping(uint256 => Proposal) private _proposals;

    //
    // Events
    //

    event ProposalCreated(uint256 indexed proposalId); // A new proposal was created with id `proposalId`.
    event TransactionSubmitted(uint256 indexed transactionId, uint256 indexed proposalId, uint256 indexed stepNum); // The transaction `transactionId` was added to the step `stepNum` of the proposal `proposalId`.
    event ProposalSubmitted(uint256 indexed proposalId, uint256 stepsCount); // The existing proposal `proposalId`, previously created, was submitted.
    event ProposalPartiallyExecuted(uint256 indexed proposalId, uint256 stepsCountLeft); // All the transactions of a step which is not the last step of the proposal `proposalId` have been executed. There are `stepsCountLeft` steps pending execution.
    event ProposalFullyExecuted(uint256 indexed proposalId); // All the transactions of all the steps of the proposal `proposalId` have been executed.
    event TransactionExecuted(uint256 indexed transactionId); // The transaction `transactionId` was executed successfully.
    event TransactionExecutedFail(uint256 indexed transactionId); // The transaction `transactionId` execution attempt failed.
    event Deposited(address indexed sender, uint256 value); // A total of `value` coins have been deposited into the Wallet by address `sender`.
    event Called(bool indexed result, bytes indexed resultMem); // An external call has been attempted. If successfully, `result` is true.

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

    modifier fromTrusted() {
        if (!isTestMode()) require(_assembly.isTrusted(msg.sender), "You are not trusted to perform this operation");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < _proposalCount, "Wrong proposal id");
        _;
    }

    modifier proposalNotYetFullyExecuted(uint256 proposalId) {
        require(_proposals[proposalId].status != ProposalStatus.FullyExecuted, "Proposal was already fully executed");
        _;
    }

    modifier transactionExists(uint256 transactionId) {
        require(transactionId < _transactionCount, "Wrong transaction id");
        _;
    }

    modifier transactionNotYetExecuted(uint256 transactionId) {
        require(!_transactions[transactionId].executed, "Transaction was already executed");
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

    /// @return The status, the executed steps and the transaction ids (per step) for a given proposal id
    function getProposal(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (
            ProposalStatus,
            uint256,
            uint256[][] memory
        )
    {
        Proposal storage p = _proposals[proposalId];
        return (p.status, p.executedSteps, p.transactionIds);
    }

    /// @return The number of proposals ever created.
    function getProposalCount() external view override returns (uint256) {
        return _proposalCount;
    }

    /// @return The transaction object for a given transaction id.
    function getTransaction(uint256 id) external view transactionExists(id) returns (Transaction memory) {
        return _transactions[id];
    }

    /// @return The number of transactions ever created.
    function getTransactionCount() external view returns (uint256) {
        return _transactionCount;
    }

    /// @dev Creates a new proposal object. Only trusted members of the DAO can perform this operation.
    /// @return The id of the new transaction.
    function createProposal() external isInitialized fromTrusted returns (uint256) {
        uint256 proposalId = _proposalCount;
        Proposal memory p;
        p.creator = msg.sender;
        p.status = ProposalStatus.Created;
        _proposals[proposalId] = p;
        _proposalCount++;
        emit ProposalCreated(proposalId);
        return proposalId;
    }

    /// @dev Submits the proposal so it can be executed if approved by the DAO. Only the proposal creator can perform this operation.
    function submitProposal(uint256 proposalId) external isInitialized proposalExists(proposalId) {
        Proposal storage p = _proposals[proposalId];
        require(p.creator == msg.sender, "Only the proposal creator can perform this operation");
        require(p.transactionIds.length > 0, "No transactions were submitted for this proposal");
        require(p.status == ProposalStatus.Created, "Wrong proposal status");
        p.status = ProposalStatus.Submitted;
        emit ProposalSubmitted(proposalId, p.transactionIds.length);
    }

    /// @dev Submits a transaction and allocates it to a proposal step. Only the proposal creator can perform this operation,
    ///      and only if the proposal has not been submitted yet. Steps need to be created consecutively.
    ///      Steps need to contain at least one transaction.
    /// @param destination The transaction destination.
    /// @param value The transaction value.
    /// @param data The transaction data.
    /// @param proposalId The proposal id.
    /// @param stepNum The step number to which the transaction is added.
    /// @return The new transaction's id.
    function submitTransaction(
        address destination,
        uint256 value,
        bytes memory data,
        uint256 proposalId,
        uint256 stepNum
    ) external isInitialized proposalExists(proposalId) returns (uint256) {
        uint256 transactionId = _transactionCount;
        _transactions[transactionId] = Transaction({destination: destination, value: value, data: data, executed: false});
        _transactionCount++;

        Proposal storage p = _proposals[proposalId];
        require(p.creator == msg.sender, "Only the proposal creator can perform this operation");
        require(p.status == ProposalStatus.Created, "Proposal was already submitted and cannot be changed");
        require(stepNum <= p.transactionIds.length, "You need to submit at least one transaction into any prior empty steps first");
        if (stepNum == p.transactionIds.length) {
            uint256[] memory step;
            p.transactionIds.push(step);
        }

        p.transactionIds[stepNum].push(transactionId);
        emit TransactionSubmitted(transactionId, proposalId, stepNum);
        return transactionId;
    }

    /// @dev Execute the next pending step of a proposal. Only the Assembly can do this operation.
    /// @param proposalId The id of the proposal to execute.
    /// @return Whether or not all transactions of the step were succesfully executed.
    function executeProposal(uint256 proposalId) external override isInitialized onlyAssembly proposalExists(proposalId) proposalNotYetFullyExecuted(proposalId) nonReentrant returns (bool) {
        Proposal storage p = _proposals[proposalId];
        require(p.status == ProposalStatus.Submitted || p.status == ProposalStatus.PartiallyExecuted, "Wrong proposal status");

        uint256 stepNum = p.executedSteps;
        for (uint256 transactionNum = 0; transactionNum < p.transactionIds[stepNum].length; transactionNum++) {
            uint256 transactionId = p.transactionIds[stepNum][transactionNum];
            if (!_executeTransaction(transactionId)) revert("Proposal step could not be executed");
        }

        p.executedSteps++;
        if (p.executedSteps >= p.transactionIds.length) {
            p.status = ProposalStatus.FullyExecuted;
            emit ProposalFullyExecuted(proposalId);
            return true;
        }
        p.status = ProposalStatus.PartiallyExecuted;
        emit ProposalPartiallyExecuted(proposalId, p.transactionIds.length - p.executedSteps);
        return false;
    }

    /// @dev Execute a transaction that has not yet been executed.
    /// @param transactionId The id of the proposal to execute.
    /// @return Whether or not the transaction was succesfully executed.
    function _executeTransaction(uint256 transactionId) internal transactionExists(transactionId) transactionNotYetExecuted(transactionId) returns (bool) {
        Transaction storage txn = _transactions[transactionId];
        if (_externalCall(txn.destination, txn.value, txn.data)) {
            emit TransactionExecuted(transactionId);
            txn.executed = true;
            return true;
        } else {
            emit TransactionExecutedFail(transactionId);
            return false;
        }
    }

    /// @dev It can transfer coins and/or call a function of a contract.
    /// @param destination The address to send the coins or the address of the contract whose function to call.
    /// @param value The number of coins to send.
    /// @param data Contains the signature of the function to call and the input parameters.
    /// @return Whether or not the transaction was succesfully executed.
    function _externalCall(
        address destination,
        uint256 value,
        bytes memory data
    ) private returns (bool) {
        bool result;
        bytes memory resultMem;
        (result, resultMem) = destination.call{value: value}(data);
        emit Called(result, resultMem);
        return result;
    }

    /// @dev Emit an event when coins are received (regarless of msg.data).
    fallback() external payable {
        require(_initialized, "Contract has not yet been initialized");
        if (msg.value > 0) emit Deposited(msg.sender, msg.value);
    }

    //
    // Upgrade
    //

    function _authorizeUpgrade(address newImplementation) internal override onlyMe {
        require(newImplementation != address(0), "New implementation contract address cannot be zero");
    }
}
