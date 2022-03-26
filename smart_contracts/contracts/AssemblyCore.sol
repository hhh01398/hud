// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./IAssemblyCore.sol";
import "./IProofOfHumanity.sol";
import "./Wallet.sol";

/// @title Assembly contract implementing a semi-direct democracy and on-chain tallying.
/// @dev This contract manages citizen and delegate registration, voting, tallying and execution of transaction proposals. In conjunction with the Wallet contract, this contract implements a democratic (not "tokencratic") Decentralized Autonomous Organization (DAO) consisting of a semi-direct democracy following the 1-human-1-vote principle, optional vote delegation and on-chain tallying. The only prerrequisite to register in the DAO is to prove to be a human, which is done through Proof-of-Humanity. Humans can participate in the DAO as citizens and as delegates. Proposals, which are chain transactions, need to be approved by a majority, determined by a certain threshold percentage, to be executed. Delegates voting power is proportional to the amount of citizens. A quorum is needed to approve proposals. DAO members can be flagged as distrusted by the DAO. Members whose humanity proof is no longer valid or have become distrusted can be expelled from the DAO.
///
/// The voting process consist of the following steps:
/// 1. Transaction submission: A transaction proposal is submitted to the Wallet contract.
/// 2. Creation of a tally: A tally to vote on the proposal is created.
/// 3. Voting: Delegates (and optionally citizens) cast their votes. The voting period is divided into 2 phases: deliberation and revocation.
///
/// | ------------------- tallyDuration-------------------- |
/// | -- Deliberation phase -- | -- Revocation phase -- ... | --- Enaction ...
/// | -- Delegates can vote -- | 
/// | -- Citizens can vote -------------------------------- | 
/// | ------------------------------------------------------------------------ > time
///
/// Citizens can cast their votes during either phase whereas delegates can only during the deliberation phase. This phase is intended to enable citizens the possibility of revoking any proposal that might have been approved by the delegates against the actual preference of their appointed citizens, as a citizen's majority superseds a delegate's majority.
/// 4. Tallying up and enaction: Votes are counted and, if the proposal is approved, the transaction is executed
contract AssemblyCore is UUPSUpgradeable, ReentrancyGuardUpgradeable, IERC20, IAssemblyCore {
    IProofOfHumanity private _poh;
    IWallet private _wallet;
    address private _owner; // for practical purposes, owner and wallet are defined using different variables although they have the same value as the Wallet contract is the owner of the Assembly contract
    bool private _initialized;
    address private _creator;

    //
    // Population
    //

    uint256 internal _citizenCount;
    mapping(address => bool) internal _isInCitizenCount;

    uint256 private _delegateCount;
    mapping(address => bool) internal _isInDelegateCount;
    mapping(address => address) private _appointments; // citizen => delegate
    mapping(address => uint256) private _appointmentCount; // delegate => no. of citizens

    address[] private _delegateSeats; // the addresses of the delegates seating
    mapping(address => bool) private _isSeated;
    mapping(address => uint256) private _delegateSeat;

    mapping(address => bool) private _isDistrusted;

    //
    // Voting
    //

    mapping(uint256 => Tally) internal _tallies;
    uint256 private _tallyCount;

    mapping(uint256 => mapping(address => bool)) private _delegateVotes;
    mapping(uint256 => mapping(address => VoteStatus)) private _citizenVotes;

    //
    // Parameters
    //

    uint256 public constant DEFAULT_THRESHOLD = 50;

    uint256 private _votingPercentThreshold;
    uint256 private _seatCount;
    uint256 private _citizenCountQuorum;
    uint256 private _tallyDuration;

    //
    // Events
    //

    // population
    event CitizenApplication(address indexed citizen, uint256 numCitizens);
    event DelegateApplication(address indexed delegate, uint256 numDelegates);
    event Distrust(address indexed account);
    event Expelled(address indexed member);

    // evolution
    event AppointDelegate(address indexed delegate, address indexed citizen);
    event DelegateSeatUpdate(uint256 indexed seatNumber, address indexed delegate);
    event NewTally(uint256 indexed tallyId);
    event DelegateVote(uint256 indexed tallyId, bool yay, address indexed delegate);
    event CitizenVote(uint256 indexed tallyId, bool yay, address indexed citizen);
    event Tallied(uint256 indexed tallyId);
    event Enacted(uint256 indexed tallyId);

    // configuration
    event VotingPercentThreshold(uint256 votingPercentThreshold);
    event SeatCount(uint256 seatCount);
    event Quorum(uint256 citizenCountQuorum);
    event TallyDuration(uint256 tallyDuration);

    //
    // Modifiers
    //

    modifier isInitialized() {
        require(_initialized, "Contract has not yet been initialized");
        _;
    }

    modifier onlyOwner() {
        require((_owner == msg.sender) || isTestMode(), "You are not allowed to do this");
        _;
    }

    /// @dev To be used on functions prone to be abused otherwise.
    modifier onlyTrusted() {
        require(isTrusted(msg.sender), "You are not trusted to perform this operation");
        _;
    }

    //
    // Test functions (to be n for testing purposes only).
    //

    function isTestMode() public view virtual returns (bool) {
        return false;
    }

    function setTestMode(bool testMode) external virtual {}

    //
    // Functions
    //

    function getCreator() external view returns (address) {
        return _creator;
    }

    function setCreator(address newCreator) external {
        require(msg.sender == _creator, "You are not allowed to do this");
        require(newCreator != _creator, "The new address must be different");
        require(newCreator != address(0), "Creator address cannot be zero");

        _creator = newCreator;
    }

    function getPoh() external view returns (address) {
        return address(_poh);
    }

    function getWallet() external view returns (address) {
        return address(_wallet);
    }

    function getOwner() external view returns (address) {
        return address(_owner);
    }

    function isHuman(address account) public view isInitialized returns (bool) {
        return account == _creator || _poh.isRegistered(account); // the creator's humanity proof is not required
    }

    function isCitizen(address _human) external view returns (bool) {
        return _isInCitizenCount[_human];
    }

    function isDelegate(address _delegate) external view returns (bool) {
        return _isInDelegateCount[_delegate];
    }

    function getCitizenCount() external view returns (uint256) {
        return _citizenCount;
    }

    function getDelegateCount() external view returns (uint256) {
        return _delegateCount;
    }

    function getAppointedDelegate() external view returns (address) {
        return _appointments[msg.sender];
    }

    function getAppointmentCount(address _delegate) external view returns (uint256) {
        return _appointmentCount[_delegate];
    }

    function getVotingPercentThreshold() external view returns (uint256) {
        return _votingPercentThreshold;
    }

    function getSeatCount() external view returns (uint256) {
        return _seatCount;
    }

    function getQuorum() external view returns (uint256) {
        return _citizenCountQuorum;
    }

    function getTallyDuration() external view returns (uint256) {
        return _tallyDuration;
    }

    function getDelegateSeats() external view returns (address[] memory) {
        return _delegateSeats;
    }

    function isDelegateSeated(address _delegate) external view returns (bool) {
        return _isSeated[_delegate];
    }

    function getDelegateSeat(address _delegate) external view returns (uint256) {
        return _delegateSeat[_delegate];
    }

    function getDelegateSeatAppointmentCounts() public view returns (address[] memory, uint256[] memory) {
        uint256[] memory ret;

        if (_delegateSeats.length > 0) {
            ret = new uint256[](_delegateSeats.length);
            for (uint256 i = 0; i < _delegateSeats.length; i++) ret[i] = _appointmentCount[_delegateSeats[i]];
        }

        return (_delegateSeats, ret);
    }

    function isTrusted(address account) public view returns (bool) {
        return isHuman(account) && !_isDistrusted[account];
    }

    /// @param tallyId The id of the tally.
    /// @return Vote sign that the sender cast as a delegate.
    function getDelegateVote(uint256 tallyId) external view returns (bool) {
        require(_isInDelegateCount[msg.sender], "You are not a delegate");
        return _delegateVotes[tallyId][msg.sender];
    }

    /// @param tallyId The id of the tally.
    /// @return Vote sign that the sender cast as a citizen.
    function getCitizenVote(uint256 tallyId) external view returns (VoteStatus) {
        require(_isInCitizenCount[msg.sender], "You are not a citizen");
        return _citizenVotes[tallyId][msg.sender];
    }

    /// @param tallyId The id of the tally.
    /// @return The tally struct.
    function getTally(uint256 tallyId) external view returns (Tally memory) {
        return _tallies[tallyId];
    }

    /// @param tallyId The id of the tally.
    /// @return The phase which the tally is on.
    function getTallyPhase(uint256 tallyId) public view returns (TallyPhase) {
        Tally storage t = _tallies[tallyId];

        if (block.timestamp < t.revocationStartTime) return TallyPhase.Deliberation;
        else if (block.timestamp < t.votingEndTime) return TallyPhase.Revocation;
        return TallyPhase.Ended;
    }

    /// @return The total number of tallies ever created.
    function getTallyCount() external view returns (uint256) {
        return _tallyCount;
    }

    /// @dev The contract needs to be initialized before use.
    /// @param poh The contract implementing the Proof-of-Humanity interface.
    /// @param owner The address of the Wallet contract.
    /// @param wallet The address of the Wallet contract.
    /// @param seatCount Number of seats to be sat by delegates.
    /// @param citizenCountQuorum Smallest number of citizens registered to approve a proposal.
    /// @param tallyDuration Total duration of each tally.
    function _initialize(
        address poh,
        address owner,
        address wallet,
        uint256 seatCount,
        uint256 citizenCountQuorum,
        uint256 tallyDuration
    ) internal {
        require(!_initialized, "Contract has already been initialized");
        require(poh != address(0), "PoH contract address cannot be zero");
        require(owner != address(0), "Owner address cannot be zero");
        require(wallet != address(0), "Wallet contract address cannot be zero");
        require(seatCount > 0, "Invalid number of seats");

        _poh = IProofOfHumanity(address(poh));
        _owner = owner;
        _wallet = IWallet(address(wallet));

        _votingPercentThreshold = DEFAULT_THRESHOLD;
        _seatCount = seatCount;
        _citizenCountQuorum = citizenCountQuorum;
        _tallyDuration = tallyDuration;

        _creator = msg.sender;
        _initialized = true;
    }

    //
    // Population
    //

    function applyForCitizenship() external isInitialized {
        require(isHuman(msg.sender), "You are not a human");
        require(!_isDistrusted[msg.sender], "You are not trusted");
        require(!_isInCitizenCount[msg.sender], "You are a citizen already");

        _isInCitizenCount[msg.sender] = true;
        _citizenCount++;

        emit CitizenApplication(msg.sender, _citizenCount);
    }

    /// @dev Any human can apply for delegation.
    function applyForDelegation() external isInitialized {
        require(isHuman(msg.sender), "You are not a human");
        require(!_isDistrusted[msg.sender], "You are not trusted");
        require(!_isInDelegateCount[msg.sender], "You are a delegate already");

        _isInDelegateCount[msg.sender] = true;
        _delegateCount++;

        emit DelegateApplication(msg.sender, _delegateCount);
    }

    /// @dev Citizens can optionally appoint a delegate they trust.
    /// @param delegate The address of the delegate to appoint to.
    function appointDelegate(address delegate) external isInitialized {
        require(_isInCitizenCount[msg.sender], "You are not a citizen");
        require(_isInDelegateCount[delegate], "The address does not belong to a delegate");
        require(_appointments[msg.sender] != delegate, "You already appointed this delegate");

        if (_appointments[msg.sender] != address(0)) _appointmentCount[_appointments[msg.sender]]--;
        _appointments[msg.sender] = delegate;
        _appointmentCount[delegate]++;

        emit AppointDelegate(delegate, msg.sender);
    }

    /// @dev Delegates can opt in to take a seat under 2 conditions:
    ///         - The seat is empty.
    ///         - The number of citizen appointments of the delegate currently sitting in the seat is lower than the new delegate's.
    ///         Note: Seat reallocation is not triggered automatically after a new appointment but instead it needs to be executed on demand by calling this function by the beneficiary delegate. This is needed to start accruing delegation reward tokens.
    /// @param seatNumber The number of the seat to claim.
    /// @return The seat number on wich the delegate seats now.
    function claimSeat(uint256 seatNumber) external isInitialized onlyTrusted returns (uint256) {
        require(seatNumber < _seatCount, "Wrong seat number");
        require(_isInDelegateCount[msg.sender], "You are not a delegate");
        require(!_isSeated[msg.sender], "You are already seated");

        bool seated;

        if (seatNumber >= _delegateSeats.length) {
            _delegateSeats.push(msg.sender);
            seatNumber = _delegateSeats.length - 1;
            seated = true;
        } else if (!_isInDelegateCount[_delegateSeats[seatNumber]]) {
            _isSeated[_delegateSeats[seatNumber]] = false;
            seated = true;
        } else {
            require(_appointmentCount[msg.sender] > _appointmentCount[_delegateSeats[seatNumber]], "Not enought citizens support the delegate");
            _isSeated[_delegateSeats[seatNumber]] = false;
            seated = true;
        }

        if (seated) {
            _delegateSeats[seatNumber] = msg.sender;
            _isSeated[msg.sender] = true;
            _delegateSeat[msg.sender] = seatNumber;
            emit DelegateSeatUpdate(seatNumber, msg.sender);
            return seatNumber;
        } else revert("Did not update seats");
    }

    //
    // Voting
    //

    /// @param proposalId The id of the proposed transaction.
    /// @return The id of the new tally.
    function createTally(uint256 proposalId) external isInitialized onlyTrusted returns (uint256) {
        require(proposalId < _wallet.getProposalCount(), "Wrong proposal id");

        Tally memory t;

        t.proposalId = proposalId;
        t.status = TallyStatus.ProvisionalNotApproved;
        t.submissionTime = block.timestamp;
        t.revocationStartTime = t.submissionTime + _tallyDuration / 2;
        t.votingEndTime = t.submissionTime + _tallyDuration;
        t.citizenCount = _citizenCount;

        uint256 tallyId = _tallyCount;
        _tallies[tallyId] = t;
        emit NewTally(tallyId);
        _tallyCount++;
        return tallyId;
    }

    function castDelegateVote(uint256 tallyId, bool yay) external isInitialized {
        require(tallyId < _tallyCount, "Wrong tally id");
        require(_isInDelegateCount[msg.sender], "You are not a delegate");
        TallyPhase phase = getTallyPhase(tallyId);
        require(phase != TallyPhase.Ended, "The voting has ended");
        require(phase != TallyPhase.Revocation, "Delegates cannot vote during the revocation phase");
        require(_delegateVotes[tallyId][msg.sender] != yay, "That is your current vote already");

        _delegateVotes[tallyId][msg.sender] = yay;
        emit DelegateVote(tallyId, yay, msg.sender);
    }

    function castCitizenVote(uint256 tallyId, bool yay) external isInitialized {
        require(tallyId < _tallyCount, "Wrong tally id");
        require(_isInCitizenCount[msg.sender], "You are not a citizen");
        TallyPhase phase = getTallyPhase(tallyId);
        require(phase != TallyPhase.Ended, "The voting has ended");

        VoteStatus previousVoteStatus = _citizenVotes[tallyId][msg.sender];
        VoteStatus newVoteStatus = yay ? VoteStatus.Yay : VoteStatus.Nay;

        if (previousVoteStatus == newVoteStatus) revert("That is your current vote already");

        Tally storage t = _tallies[tallyId];
        if (previousVoteStatus == VoteStatus.Yay) t.citizenYays--;
        if (previousVoteStatus == VoteStatus.Nay) t.citizenNays--;
        if (newVoteStatus == VoteStatus.Yay) t.citizenYays++;
        if (newVoteStatus == VoteStatus.Nay) t.citizenNays++;
        _citizenVotes[tallyId][msg.sender] = newVoteStatus;
        emit CitizenVote(tallyId, yay, msg.sender);
    }

    /// @dev Require a quorum, i.e. the smallest number of citizens that need to be registered in the DAO in order to finalize a voting.
    ///         A quorum is required to lower the risk of centralization, i.e. avoid critical votings being controled by a small minority with a common goal against the general interest of the DAO. This risk is higher soon after the DAO's creation, when its population has not grown enough yet.
    /// @return Returns true if the number of citizens fulfills the quorum or if the sender is the creator.
    function isQuorumReached() public view isInitialized returns (bool) {
        if (isTestMode()) return true;
        return _citizenCount >= _citizenCountQuorum;
    }

    /// @dev Counts the votes of a tally and updates its status accordingly.
    ///         Note that delegates could effectively not having any approval power if not enough citizens appoint delegates.
    /// @param tallyId The id of the tally whose votes to count.
    function tallyUp(uint256 tallyId) public isInitialized {
        require(tallyId < _tallyCount, "Wrong tally id number");
        Tally storage t = _tallies[tallyId];
        require(t.status == TallyStatus.ProvisionalNotApproved || t.status == TallyStatus.ProvisionalApproved, "The tally cannot be changed");
        t.citizenCount = _citizenCount;
        uint256 voteThreshold = (_citizenCount * _votingPercentThreshold) / 100;
        bool finalNayOrYay;

        // Delegate voting
        uint256 yays;
        for (uint256 i = 0; i < _delegateSeats.length; i++) {
            if (_delegateVotes[tallyId][_delegateSeats[i]]) yays += _appointmentCount[_delegateSeats[i]];
        }
        t.delegatedYays = yays;
        finalNayOrYay = yays > voteThreshold ? true : false;

        // Citizen voting
        // If there are enough citizen votes, the citizen voting s the delegate voting.
        if (t.citizenYays > voteThreshold || t.citizenNays > voteThreshold) {
            finalNayOrYay = t.citizenYays > t.citizenNays ? true : false;
        }

        // Result
        if (getTallyPhase(tallyId) == TallyPhase.Ended) {
            // As it may take long to reach a quorum, the DAO's creator can circumvent the quorum restriction.
            if (!isQuorumReached() && msg.sender != _creator) revert("Tally cannot be ended as quorum is not reached");
            t.status = finalNayOrYay ? TallyStatus.Approved : TallyStatus.NotApproved;
        } else {
            t.status = finalNayOrYay ? TallyStatus.ProvisionalApproved : TallyStatus.ProvisionalNotApproved;
        }

        emit Tallied(tallyId);
    }

    /// @dev Executes (enacts) a transaction if approved.
    /// @param tallyId The id of the tally to enact.
    /// @return True if the transacion was executed, false otherwise.
    function enact(uint256 tallyId) public nonReentrant returns (bool) {
        require(tallyId < _tallyCount, "Wrong tally id number");

        Tally storage t = _tallies[tallyId];
        require(t.status == TallyStatus.Approved, "The proposal was not approved or was already enacted");

        if (_wallet.executeProposal(t.proposalId)) {
            t.status = TallyStatus.Enacted;
            emit Enacted(tallyId);
            return true;
        }
        return false;
    }

    /// @dev Flags an address as distrusted by the DAO.
    /// @param account The address to distrust
    function distrust(address account) external onlyOwner {
        require(!_isDistrusted[account], "The address is already distrusted");

        _isDistrusted[account] = true;
        emit Distrust(account);
    }

    /// @dev Expels a member of the DAO. Reasons for this can be a no longer valid humanity proof or becoming distrusted.
    /// @param account The address to expel.
    function expel(address account) external isInitialized onlyOwner {
        bool expelled = !isHuman(account) || _isDistrusted[account];

        if (!expelled) revert("Cannot be expelled");

        if (_isInDelegateCount[account]) {
            // Citizens who appointed this delegate can appoint another delegate.
            _isInDelegateCount[account] = false;
            _delegateCount--;
        }

        if (_isInCitizenCount[account]) {
            _isInCitizenCount[account] = false;
            _citizenCount--;

            if (_appointments[account] != address(0)) {
                _appointmentCount[_appointments[account]]--;
                _appointments[account] = address(0);
            }
        }

        emit Expelled(account);
    }

    //
    // Parameters
    //

    /// @dev Proposals are approved if the total percentage of citizen votes (delegated or not) is positive. Simple majority is never enough to approve a proposal, absolute majority is always needed.
    /// @param newVotingPercentThreshold The new voting percentage threshold.
    function setVotingPercentThreshold(uint256 newVotingPercentThreshold) external isInitialized onlyOwner {
        require(_votingPercentThreshold != newVotingPercentThreshold, "The new parameter value must be different");
        require(newVotingPercentThreshold <= 100 && newVotingPercentThreshold >= 50, "Invalid parameter value");
        _votingPercentThreshold = newVotingPercentThreshold;
        emit VotingPercentThreshold(_votingPercentThreshold);
    }

    /// @dev Creates empty new seats.
    /// @param newSeatCount The new total number of seats.
    function setSeatCount(uint256 newSeatCount) external isInitialized onlyOwner {
        require(_seatCount != newSeatCount, "The new parameter value must be different");
        require(_seatCount < newSeatCount, "Decreasing the number of seats is not supported");

        _seatCount = newSeatCount;
        emit SeatCount(_seatCount);
    }

    function setQuorum(uint256 newCitizenCountQuorum) external isInitialized onlyOwner {
        require(_citizenCountQuorum != newCitizenCountQuorum, "The new parameter value must be different");
        _citizenCountQuorum = newCitizenCountQuorum;
        emit Quorum(_citizenCountQuorum);
    }

    function setTallyDuration(uint256 newTallyDuration) external isInitialized onlyOwner {
        require(_tallyDuration != newTallyDuration, "The new parameter value must be different");
        require(newTallyDuration > 0, "Invalid parameter value");
        _tallyDuration = newTallyDuration;
        emit TallyDuration(_tallyDuration);
    }

    //
    // Upgrade
    //

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        require(newImplementation != address(0), "New implementation contract address cannot be zero");
    }

    // ERC20 interface implementation for Snapshot

    function balanceOf(address delegate) external view returns (uint256) {
        require(_isInDelegateCount[delegate], "Address is not a delegate");

        return _appointmentCount[delegate];
    }

    function totalSupply() external view returns (uint256) {
        return _citizenCount;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        return false;
    }

    function allowance(address owner, address spender) external view returns (uint256) {}

    function approve(address spender, uint256 amount) external returns (bool) {
        return false;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        return false;
    }
}
