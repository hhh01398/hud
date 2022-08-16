
const { BN, time, expectRevert, snapshot } = require('@openzeppelin/test-helpers');

const {
    getAccountRoles,
    deployAssembly,
    deployAll,
    initializeAssembly,
    initializeToken,
    initializeFaucet,
    initializeAll,
    buildSeatScenario,
    createTally,
    TALLY_STATUS,
    REVERT_MESSAGES,
    distributeDelegationReward,
    parseTally,
    createProposal,
    submitTransaction,
} = require('../scripts/common');

const {
    DELEGATION_REWARD_RATE,
    REFERRAL_REWARD,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOKEN_SUPPLY,
    FAUCET_INITIAL_BALANCE,
} = require('../deployment-params');

const DELEGATION_REWARD_TIME = new BN('10');

async function runAssemblyIncentivationTests(artifacts, accounts) {
    const roles = getAccountRoles(accounts);
    let poh, assembly, wallet, token, faucet;

    describe('Incentivation', async () => {
        describe('Referrals', async () => {
            before('Set up scenario', async () => {
                [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: true });

                await poh.setTestMode(true);
                await assembly.setTestMode(true);
                await initializeAll(poh, assembly, wallet, token, faucet, roles);
                await buildSeatScenario(roles, poh, assembly);
            });

            it('Referreres cannot refer themselves', async () => {
                await expectRevert(assembly.claimReferralReward(roles.citizen2, { from: roles.citizen2 }), REVERT_MESSAGES.referThemselves);
            });

            it('Referrer needs to be a citizen or a delegate', async () => {
                await expectRevert(assembly.claimReferralReward(roles.other, { from: roles.citizen2 }), REVERT_MESSAGES.referrerMust);
            });

            it('Referred needs to be a citizen or a delegate', async () => {
                await expectRevert(assembly.claimReferralReward(roles.citizen1, { from: roles.other }), REVERT_MESSAGES.referredMust);
            });

            it('Can claim referral reward', async () => {
                expect(await token.balanceOf(roles.citizen1)).to.be.bignumber.equal('0');
                expect(await token.balanceOf(roles.citizen2)).to.be.bignumber.equal('0');

                await assembly.claimReferralReward(roles.citizen1, { from: roles.citizen2 });

                expect(await token.balanceOf(roles.citizen1)).to.be.bignumber.equal((await assembly.getReferralRewardParams())[1]);
                expect(await token.balanceOf(roles.citizen2)).to.be.bignumber.equal((await assembly.getReferralRewardParams())[0]);
            });

            it('Cannot claim referred amount twice', async () => {
                await expectRevert(assembly.claimReferralReward(roles.citizen3, { from: roles.citizen2 }), 'You have already claimed your referred amount');
            });

            it('Can get rewarded as referrer more than once', async () => {
                const balanceBefore = await token.balanceOf(roles.citizen1);
                await assembly.claimReferralReward(roles.citizen1, { from: roles.citizen3 });
                expect(balanceBefore.add((await assembly.getReferralRewardParams())[1])).to.be.bignumber.equal(await token.balanceOf(roles.citizen1));
            });
        });

        describe('Delegation reward', async () => {
            let timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount;

            before('Set up scenario', async () => {
                [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: true });
                await assembly.setTestMode(true);

                await initializeAssembly(assembly, poh.address, roles.owner, roles.wallet, faucet.address, roles);
                expect(await assembly.getDelegationRewardRate()).to.be.bignumber.equal(DELEGATION_REWARD_RATE);

                await initializeToken(token, TOKEN_NAME, TOKEN_SYMBOL, [], TOKEN_SUPPLY, wallet.address, roles.governor, roles.upgrader, faucet.address, FAUCET_INITIAL_BALANCE);
                await initializeFaucet(faucet, assembly.address, roles.wallet, token.address, roles.upgrader)
            });

            it('Distribute delegation reward', async () => {
                await poh.registerHuman(roles.delegate1);
                await assembly.applyForDelegation({ from: roles.delegate1 });
                await poh.registerHuman(roles.citizen1);
                await assembly.applyForCitizenship({ from: roles.citizen1 });
                await assembly.appointDelegate(roles.delegate1, { from: roles.citizen1 });
                await assembly.claimSeat(0, { from: roles.delegate1 });

                // Time0:
                // Seat0 / Delegate1 / Human1
                await assembly.distributeDelegationReward();

                expect(await assembly.getRewardBalance(roles.delegate1)).to.be.bignumber.equal('0');

                timestamp = await assembly.getLastSnapshotTimestamp();
                faucetBalance = await token.balanceOf(faucet.address);
                delegateBalances = await Promise.all((await assembly.getDelegateSeats()).map(async function (delegate) { return await token.balanceOf(delegate) }));
                delegateSeatAppointmentCounts = await assembly.getDelegateSeatAppointmentCounts();
                appointmentsTotalCount = await assembly.getCitizenCount();

                await time.increase(DELEGATION_REWARD_TIME);

                [timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount] =
                    await distributeDelegationReward(assembly, token, faucet,
                        timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount);

                expect(await assembly.getRewardBalance(roles.delegate1)).to.be.bignumber.equal('0');
            });

            it('Cannot claim if reward balance is zero', async () => {
                expect(await assembly.getRewardBalance(roles.delegate1)).to.be.bignumber.equal('0');
                await expectRevert(assembly.claimRewards({ from: roles.delegate1 }), REVERT_MESSAGES.noRewardToClaim);
            });

            it('Changing delegation appointing distribution', async () => {
                await poh.registerHuman(roles.delegate2);
                await assembly.applyForDelegation({ from: roles.delegate2 });
                await poh.registerHuman(roles.citizen2);
                await assembly.applyForCitizenship({ from: roles.citizen2 });
                await assembly.appointDelegate(roles.delegate2, { from: roles.citizen2 });
                await assembly.claimSeat(1, { from: roles.delegate2 });

                // Time2:
                // Seat0 / Delegate1 / Human1
                // Seat1 / Delegate2 / Human2

                await time.increase(DELEGATION_REWARD_TIME);

                [timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount] =
                    await distributeDelegationReward(assembly, token, faucet,
                        timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount);

                await time.increase(DELEGATION_REWARD_TIME);

                await poh.registerHuman(roles.citizen3);
                await assembly.applyForCitizenship({ from: roles.citizen3 });
                await assembly.appointDelegate(roles.delegate2, { from: roles.citizen3 });

                [timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount] =
                    await distributeDelegationReward(assembly, token, faucet,
                        timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount);

                await time.increase(DELEGATION_REWARD_TIME);

                await assembly.appointDelegate(roles.delegate1, { from: roles.citizen3 });

                [timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount] =
                    await distributeDelegationReward(assembly, token, faucet,
                        timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount);

                await time.increase(DELEGATION_REWARD_TIME);

                [timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount] =
                    await distributeDelegationReward(assembly, token, faucet,
                        timestamp, faucetBalance, delegateBalances, delegateSeatAppointmentCounts, appointmentsTotalCount);
            });
        });

        describe('Execution rewards', async () => {
            const BASE = new BN('2');
            let tallyId;
            let snapshotEnacted;

            async function testExecutionReward(numSecsEstimate, hitMax = false) {
                await snapshotEnacted.restore();
                const rewardBalanceBefore = await assembly.getRewardBalance(roles.operator);
                const tt = await assembly.getTally(tallyId);
                const tally = parseTally(tt);
                await time.increaseTo((new BN(tally.votingEndTime)).add(numSecsEstimate));

                expect(parseInt(tally.status)).to.be.equal(TALLY_STATUS.ProvisionalApproved);
                const receipt = await assembly.execute(tallyId, { from: roles.operator });
                expect(receipt.logs[0].event.valueOf()).to.be.equal('Tallied');
                expect(receipt.logs[2].event.valueOf()).to.be.equal('Enacted');
                expect(receipt.logs[3].event.valueOf()).to.be.equal('ExecutionReward');

                const rewardBalanceAfter = await assembly.getRewardBalance(roles.operator);
                const actualNumSecs = (await time.latest()).sub(new BN(tally.votingEndTime)); // the actual number of seconds may differ from numSecsEstimate

                const expectedReward = hitMax ? BASE.pow(await assembly.getExecRewardExponentMax()) : BASE.pow(actualNumSecs);
                expect(rewardBalanceAfter.sub(rewardBalanceBefore)).to.be.bignumber.equal(expectedReward);
            }

            before('Setup scenario', async () => {
                [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: true });
                await poh.setTestMode(true);
                await assembly.setTestMode(true);
                await initializeAll(poh, assembly, wallet, token, faucet, roles);
                await buildSeatScenario(roles, poh, assembly);

                const proposalId = await createProposal(wallet, roles.delegate1);
                await submitTransaction(wallet,
                    token.address,
                    0,
                    token.contract.methods.governorSend(await token.getReserve(), roles.other, 1, []).encodeABI(),
                    proposalId,
                    0,
                    roles.delegate1);

                await wallet.submitProposal(proposalId, { from: roles.delegate1 });
                tallyId = await createTally(assembly, proposalId, roles);

                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 });
                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate2 });
                await assembly.tallyUp(tallyId);

                tally = parseTally(await assembly.getTally(tallyId));
                await time.increaseTo(tally.votingEndTime);
                snapshotEnacted = await snapshot();
            });

            it('Wait, tally up, enact and claim reward', async () => {
                await testExecutionReward(new BN('10'));
                const maxSecs = await assembly.getExecRewardExponentMax();
                await testExecutionReward(maxSecs.sub(new BN('10')));
                await testExecutionReward(maxSecs.add(new BN('1')), hitMax = true); // testing overflow check
            });
        });
    });
}

contract('Assembly', function (accounts) {
    runAssemblyIncentivationTests(artifacts, accounts);
});
