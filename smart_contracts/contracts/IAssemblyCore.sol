// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IAssemblyCore {
    enum TallyStatus {
        ProvisionalNotApproved,
        ProvisionalApproved,
        NotApproved,
        Approved,
        Enacted
    }

    enum TallyPhase {
        Deliberation,
        Revocation,
        Ended
    }

    struct Tally {
        uint256 proposalId;
        uint256 submissionTime;
        uint256 revocationStartTime;
        uint256 votingEndTime;
        uint256 delegatedYays;
        uint256 citizenYays;
        uint256 citizenNays;
        uint256 citizenCount;
        TallyStatus status;
    }

    enum VoteStatus {
        NotVoted,
        Yay,
        Nay
    }

    function getCreator() external view returns (address);

    function isHuman(address account) external view returns (bool);

    function isCitizen(address human) external view returns (bool);

    function isDelegate(address delegate) external view returns (bool);

    function getCitizenCount() external view returns (uint256);

    function getDelegateCount() external view returns (uint256);

    function getAppointedDelegate() external view returns (address);

    function getAppointmentCount(address delegate) external view returns (uint256);

    function getVotingPercentThreshold() external view returns (uint256);

    function getSeatCount() external view returns (uint256);

    function getQuorum() external view returns (uint256);

    function getTallyDuration() external view returns (uint256);

    function getDelegateSeats() external view returns (address[] memory);

    function isTrusted(address account) external view returns (bool);

    function getDelegateVote(uint256 tallyId) external view returns (bool);

    function getCitizenVote(uint256 tallyId) external view returns (VoteStatus);

    function getTally(uint256 tallyId) external view returns (Tally memory);

    function getTallyPhase(uint256 tallyId) external view returns (TallyPhase);

    function getTallyCount() external view returns (uint256);

    function applyForCitizenship() external;

    function applyForDelegation() external;

    function appointDelegate(address delegate) external;

    function claimSeat(uint256 seatNumber) external returns (uint256);

    function createTally(uint256 proposalId) external returns (uint256);

    function castDelegateVote(uint256 tallyId, bool yay) external;

    function castCitizenVote(uint256 tallyId, bool yay) external;

    function tallyUp(uint256 tallyId) external;

    function enact(uint256 tallyId) external returns (bool);

    function distrust(address account) external;

    function expel(address account) external;

    function setVotingPercentThreshold(uint256 newVotingPercentThreshold) external;

    function setSeatCount(uint256 newSeatCount) external;

    function setQuorum(uint256 newCitizenCountQuorum) external;

    function setTallyDuration(uint256 newTallyDuration) external;
}
