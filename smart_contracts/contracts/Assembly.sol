// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "./AssemblyCore.sol";
import "./IAssemblyIncentives.sol";
import "./IProofOfHumanity.sol";
import "./Faucet.sol";

/// @title Assembly contract with economic incentives.
/// @dev This contract, together with the Token and Faucet contracts, implements the economic incentive mechanisms needed for the DAO to operate fully and that AssemblyCore lacks of, such as paying tokens for delegation, tally counting and execution of approved transactions, in addition to a simple referral scheme. The use of a Faucet contract has been added so that the reward payments do not require a DAO voting to be made but instead they can be performed upon the token receiver's request.
///
/// - Delegation: Delegates get paid tokens for the time they sit on a *seat*. This creates an incentive to seek for appointments from citizens, as only the delegates with the most appointments are eligible for a seat.
/// - Tallying and enacting: It refers to the execution of a approved transaction. The number of tokens to be paid as enaction reward increases exponentially as time passes until a maximum is reached, thus the price of the transaction is automatically determined by the market.
/// - Referral: DAO members can refer other humans to join the DAO. Both the referrer and the referred humans get a reward if the referred human joins the DAO.
///
/// Rewarded addresses can claim their tokens by calling the corresponding functions. This triggers a transfer of tokens from the Faucet contract. The DAO refills the Faucet balance periodically through a voting.
contract Assembly is AssemblyCore, IAssemblyIncentives {

    Faucet private _faucet;
    mapping(address => uint256) private _rewardBalances; // rewarded => reward

    //
    // Delegation
    //

    uint256 private _delegationRewardRate; // token/sec to distribute among seated delegates
    uint256 private _lastSnapshotTimestamp;
    address[] private _lastDelegates;
    uint256[] private _lastCitizenCounts;
    uint256 private _lastCitizenCount;

    //
    // Tallying and execution
    //

    uint256 private _execRewardExponentMax;

    //
    // Referrals
    //

    mapping(address => bool) private _referredClaimed; // referrer => referred
    uint256 private _referredAmount;
    uint256 private _referrerAmount;

    //
    // Events
    //

    event DelegationReward(uint256 totalReward);
    event ExecutionReward(address executor, uint256 reward);
    event ReferralReward(address rewarded, uint256 reward);

    //
    // Functions
    //

    /// @dev The contract needs to be initialized before use.
    /// @param poh The contract implementing the Proof-of-Humanity interface.
    /// @param owner The address of the Wallet contract.
    /// @param wallet The address of the Wallet contract.
    /// @param seatCount Number of seats to be sat by delegates.
    /// @param citizenCountQuorum Smallest number of citizens registered to approve a proposal.
    /// @param tallyDuration Total duration of each tally.
    /// @param faucet A token container for automated payments that do not require a DAO's voting.
    /// @param delegationRewardRate Tokens per second to be distributed among seated delegates as a reward.
    /// @param referralReward Tokens to pay as referral reward.
    /// @param execRewardExponentMax Maximum value of the exponent of the formula that determines the execution reward.
    function initialize(
        address poh,
        address owner,
        address wallet,
        uint256 seatCount,
        uint256 citizenCountQuorum,
        uint256 tallyDuration,
        address faucet,
        uint256 delegationRewardRate,
        uint256 referralReward,
        uint256 execRewardExponentMax
    ) external {
        super._initialize(poh, owner, wallet, seatCount, citizenCountQuorum, tallyDuration);

        require(faucet != address(0), "Faucet address cannot be zero");

        _faucet = Faucet(address(faucet));

        _delegationRewardRate = delegationRewardRate;
        _referredAmount = referralReward;
        _referrerAmount = referralReward;
        _execRewardExponentMax = execRewardExponentMax;
    }

    function getFaucet() external view returns (address) {
        return address(_faucet);
    }

    function getRewardBalance(address account) external view returns (uint256) {
        return _rewardBalances[account];
    }

    /// @dev The caller receives tokens earned for delegation or tallying/execution tasks.
    function claimRewards() external isInitialized {
        require(_rewardBalances[msg.sender] > 0, "Your reward balance is zero");

        bytes memory foo;
        _faucet.send(msg.sender, _rewardBalances[msg.sender], foo);
        _rewardBalances[msg.sender] = 0;
    }

    ///
    /// Delegation
    ///

    function getDelegationRewardRate() external view returns (uint256) {
        return _delegationRewardRate;
    }

    function setDelegationRewardRate(uint256 delegationRewardRate) external isInitialized onlyOwner {
        require(_delegationRewardRate != delegationRewardRate, "The new parameter value must be different");

        _delegationRewardRate = delegationRewardRate;
    }

    /// @return Timestamp of the last state of the delegation seats
    function getLastSnapshotTimestamp() external view returns (uint256) {
        return _lastSnapshotTimestamp;
    }

    /// @dev Stores a copy ("snapshot") of the addresses of the seated delegates and their number of citizen appointments.
    function _takeDelegationSnapshot() internal {
        (address[] memory lastDelegates, uint256[] memory lastCitizenCount) = super.getDelegateSeatAppointmentCounts();
        _lastDelegates = lastDelegates;
        _lastCitizenCounts = lastCitizenCount;
        _lastCitizenCount = _citizenCount;
        _lastSnapshotTimestamp = block.timestamp;
    }

    /// @dev A number of tokens per second are allocated among all the seated delegates proportionally to their share of citizen appointments. The distribution calculation is done by taking a snapshot of the appointment distribution. This snapshot is performed on-demand by a delegate whenever it is in his/her interest, that is, when winning a seat or increasing the share of appointments. Tokens are allocated when the next snapshot is invoked.
    function distributeDelegationReward() external {
        if (_lastCitizenCount == 0) {
            // this is first time to take a snapshot, therefore there is no previous snapshot to compute.
            _takeDelegationSnapshot();
            return;
        }

        uint256 totalReward = (block.timestamp - _lastSnapshotTimestamp) * _delegationRewardRate;

        for (uint256 i = 0; i < _lastCitizenCounts.length; i++) {
            _rewardBalances[_lastDelegates[i]] += (totalReward * _lastCitizenCounts[i]) / _lastCitizenCount;
        }

        _takeDelegationSnapshot();
        emit DelegationReward(totalReward);
    }

    ///
    /// Execution
    ///

    function getExecRewardExponentMax() external view returns (uint256) {
        return _execRewardExponentMax;
    }

    /// @dev Sets the maximum value of the exponent, which is the number of seconds passed from the proposal's endting time, of the exponential formula that that determines the number of execution reward tokens.
    /// @param execRewardExponentMax The maximum value of the exponent.
    function setExecRewardExponentMax(uint256 execRewardExponentMax) external isInitialized onlyOwner {
        require(execRewardExponentMax != _execRewardExponentMax, "The new parameter value must be different");

        _execRewardExponentMax = execRewardExponentMax;
    }

    /// @dev Tries to tally up and execute a proposed transaction for tokens as a reward.
    /// @param tallyId The tally whose associated proposed transaction can be executed.
    /// @return True if the proposed transaction was succesfully executed.
    function execute(uint256 tallyId) external returns (bool) {
        Tally storage t = _tallies[tallyId];
        if (t.status == TallyStatus.ProvisionalNotApproved || t.status == TallyStatus.ProvisionalApproved) super.tallyUp(tallyId);

        if (super.enact(tallyId)) {
            uint256 reward = 2**Math.min(block.timestamp - t.votingEndTime, _execRewardExponentMax);
            _rewardBalances[msg.sender] += reward;
            emit ExecutionReward(msg.sender, reward);
            return true;
        }
        return false;
    }

    ///
    /// Referrals
    ///

    function getReferralRewardParams() external view returns (uint256, uint256) {
        return (_referredAmount, _referrerAmount);
    }

    /// @param referredAmount Number of tokens to reward the referred human
    /// @param referrerAmount Number of tokens to reward the referrer human
    function setReferralRewardParams(uint256 referredAmount, uint256 referrerAmount) external isInitialized onlyOwner {
        require(_referredAmount != referredAmount || _referrerAmount != referrerAmount, "The new parameter value must be different");

        _referredAmount = referredAmount;
        _referrerAmount = referrerAmount;
    }

    /// @dev Referred humans can only claim their referred reward tokens once.
    /// @param referred The address of the referred human.
    /// @return Whether or not the human claimed his or her referred reward tokens.
    function isReferredClaimed(address referred) external view returns (bool) {
        return _referredClaimed[referred];
    }

    /// @dev Sends a referral reward in tokens to both the referrer and the referred humans. This function must be called by the referred human.
    /// @param referrer The address of the referrer.
    function claimReferralReward(address referrer) external isInitialized {
        require(referrer != msg.sender, "Referrers cannot refer themselves");
        require(_isInCitizenCount[msg.sender] || _isInDelegateCount[msg.sender], "To be referred, first you must become a citizen or a delegate");
        require(_isInCitizenCount[referrer] || _isInDelegateCount[referrer], "Your referrer must be a citizen or a delegate");
        require(_referredClaimed[msg.sender] == false, "You have already claimed your referred amount");
        require(_referredAmount > 0 || _referrerAmount > 0, "There are no referral rewards currently");

        bytes memory foo;
        if (_referredAmount > 0) _faucet.send(msg.sender, _referredAmount, foo);
        emit ReferralReward(msg.sender, _referredAmount);
        if (_referrerAmount > 0) _faucet.send(referrer, _referrerAmount, foo);
        emit ReferralReward(referrer, _referrerAmount);
        _referredClaimed[msg.sender] = true;
    }
}
