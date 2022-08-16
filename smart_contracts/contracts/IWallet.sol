// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IWallet {
    enum ProposalStatus {
        Created,
        Submitted,
        PartiallyExecuted,
        FullyExecuted
    }

    function getProposalCount() external view returns (uint256);

    function executeProposal(uint256 proposalId) external returns (bool success);
}
