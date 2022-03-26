const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants');

const {
    getAccountRoles,
    deployAssembly,
    initializeAssembly,
    REVERT_MESSAGES,
} = require('../scripts/common');

async function runAssemblyConfigurationTests(artifacts, accounts) {
    const roles = getAccountRoles(accounts);

    let assembly;

    describe('Configuration', async () => {
        before('Set up scenario', async () => {
            assembly = await deployAssembly(artifacts);
            await initializeAssembly(assembly, roles.other, roles.owner, roles.other, roles.other, roles);
        });

        describe('Change creator address', async () => {
            const newCreator = roles.other;

            it('Only the creator can update the creator address', async () => {
                await expectRevert(assembly.setCreator(newCreator, { from: roles.other }), REVERT_MESSAGES.cannotDoThis);
            });

            it('The new address value must be different', async () => {
                await expectRevert(assembly.setCreator(roles.creator, { from: roles.creator }), REVERT_MESSAGES.newAddressMustDiff);
            });

            it('Cannot be zero', async () => {
                await expectRevert(assembly.setCreator(ZERO_ADDRESS, { from: roles.creator }), REVERT_MESSAGES.creatorCannotZero);
            });

            it('Can change', async () => {
                expect(await assembly.getCreator()).to.be.equal(roles.creator);
                await assembly.setCreator(newCreator, { from: roles.creator });
                expect(await assembly.getCreator()).to.be.equal(newCreator);
            });
        });

        describe('Change voting percent treshold', async () => {
            it('The new parameter value must be different', async () => {
                await expectRevert(assembly.setVotingPercentThreshold(await assembly.getVotingPercentThreshold(), { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Cannot set below 50 or above 100', async () => {
                await expectRevert(assembly.setVotingPercentThreshold(new BN('49'), { from: roles.owner }), REVERT_MESSAGES.invalidValue);
                await expectRevert(assembly.setVotingPercentThreshold(new BN('101'), { from: roles.owner }), REVERT_MESSAGES.invalidValue);
            });

            it('Can change', async () => {
                const votingPercentThreshold = (await assembly.getVotingPercentThreshold()).add(new BN('1'));
                const receipt = await assembly.setVotingPercentThreshold(votingPercentThreshold, { from: roles.owner });
                expectEvent(receipt, 'VotingPercentThreshold', { votingPercentThreshold: votingPercentThreshold });
                expect(await assembly.getVotingPercentThreshold()).to.be.bignumber.equal(votingPercentThreshold);
            });
        });

        describe('Change seat count', async () => {
            it('The new parameter value must be different', async () => {
                await expectRevert(assembly.setSeatCount(await assembly.getSeatCount(), { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Cannot decrease', async () => {
                await expectRevert(assembly.setSeatCount(new BN('0'), { from: roles.owner }), REVERT_MESSAGES.cannotDecreaseSeats);
            });

            it('Can change', async () => {
                const seatCount = (await assembly.getSeatCount()).add(new BN('1'));
                const receipt = await assembly.setSeatCount(seatCount, { from: roles.owner });
                expectEvent(receipt, 'SeatCount', { seatCount: seatCount });
                expect(await assembly.getSeatCount()).to.be.bignumber.equal(seatCount);
            });
        });

        describe('Change citizen count quorum', async () => {
            it('The new parameter value must be different', async () => {
                await expectRevert(assembly.setQuorum(await assembly.getQuorum(), { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Can change', async () => {
                const citizenCountQuorum = (await assembly.getQuorum()).add(new BN('1'));
                const receipt = await assembly.setQuorum(citizenCountQuorum, { from: roles.owner });
                expectEvent(receipt, 'Quorum', { citizenCountQuorum: citizenCountQuorum });
                expect(await assembly.getQuorum()).to.be.bignumber.equal(citizenCountQuorum);
            });
        });

        describe('Change tally duration', async () => {
            it('The new parameter value must be different', async () => {
                await expectRevert(assembly.setQuorum(await assembly.getQuorum(), { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Must be greater than zero', async () => {
                await expectRevert(assembly.setTallyDuration(new BN('0'), { from: roles.owner }), REVERT_MESSAGES.invalidValue);
            });

            it('Can change', async () => {
                const tallyDuration = (await assembly.getTallyDuration()).add(new BN('1'));
                const receipt = await assembly.setTallyDuration(tallyDuration, { from: roles.owner });
                expectEvent(receipt, 'TallyDuration', { tallyDuration: tallyDuration });
                expect(await assembly.getTallyDuration()).to.be.bignumber.equal(tallyDuration);
            });
        });

        describe('Change delegation reward rate', async () => {
            it('The new parameter value must be different', async () => {
                await expectRevert(assembly.setDelegationRewardRate(await assembly.getDelegationRewardRate(), { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Can change', async () => {
                const delegationRewardRate = (await assembly.getDelegationRewardRate()).add(new BN('1'));
                await assembly.setDelegationRewardRate(delegationRewardRate, { from: roles.owner });
                expect(await assembly.getDelegationRewardRate()).to.be.bignumber.equal(delegationRewardRate);
            });
        });

        describe('Change referral rewards', async () => {
            it('The new parameter value must be different', async () => {
                const referralRewardParams = await assembly.getReferralRewardParams();
                await expectRevert(assembly.setReferralRewardParams(referralRewardParams[0], referralRewardParams[1], { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Can change', async () => {
                await assembly.setReferralRewardParams(0, 1, { from: roles.owner });
                expect(JSON.stringify(await assembly.getReferralRewardParams())).to.be.equal('{"0":"0","1":"1"}');
            });
        });

        describe('Change execution reward parameter', async () => {
            it('The new parameter value must be different', async () => {
                await expectRevert(assembly.setExecRewardExponentMax(await assembly.getExecRewardExponentMax(), { from: roles.owner }), REVERT_MESSAGES.newParameterValueMustDiff);
            });

            it('Can change', async () => {
                const execRewardExponentMax = (await assembly.getExecRewardExponentMax()).add(new BN('1'));
                await assembly.setExecRewardExponentMax(execRewardExponentMax, { from: roles.owner });
                expect(await assembly.getExecRewardExponentMax()).to.be.bignumber.equal(execRewardExponentMax);
            });
        });
    });
}

contract('Assembly', function (accounts) {
    runAssemblyConfigurationTests(artifacts, accounts);
});
