// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IWallet {
    function getProposalCount() external view returns (uint256);

    function executeProposal(uint256 transactionId) external returns (bool success);
}
