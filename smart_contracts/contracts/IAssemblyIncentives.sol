// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IAssemblyIncentives {
    function getRewardBalance(address account) external view returns (uint256);

    function claimRewards() external;

    function getDelegationRewardRate() external view returns (uint256);

    function setDelegationRewardRate(uint256 delegationRewardRate) external;

    function getLastSnapshotTimestamp() external view returns (uint256);

    function distributeDelegationReward() external;

    function getExecRewardExponentMax() external view returns (uint256);

    function setExecRewardExponentMax(uint256 execRewardExponentMax) external;

    function execute(uint256 tallyId) external returns (bool);

    function getReferralRewardParams() external view returns (uint256, uint256);

    function isReferredClaimed(address referred) external view returns (bool);

    function claimReferralReward(address referrer) external;
}
