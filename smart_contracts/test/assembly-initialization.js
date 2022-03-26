
const { BN, expectRevert } = require('@openzeppelin/test-helpers');

const {
    getAccountRoles,
    deployAll,
    initializeAll,
    DEFAULT_THRESHOLD,
    ZERO_ADDRESS,
    REVERT_MESSAGES,
} = require('../scripts/common');

const {
    SEAT_COUNT,
    TALLY_DURATION,
    CITIZEN_COUNT_QUORUM,
    DELEGATION_REWARD_RATE,
    REFERRAL_REWARD,
    EXEC_REWARD_EXPONENT_MAX,
} = require('../deployment-params');

async function runAssemblyInitializationTests(artifacts, accounts) {
    const roles = getAccountRoles(accounts);
    let poh, assembly, wallet, token, faucet;

    describe('Initialization', async () => {
        before('Set up test scenario', async () => {
            [poh, assembly, wallet, token, faucet] = await deployAll(artifacts);
        });

        it('Must initialize first', async () => {
            const revertMsg = REVERT_MESSAGES.notInitializedYed;
            await expectRevert(assembly.isHuman(ZERO_ADDRESS), revertMsg);
            await expectRevert(assembly.applyForDelegation(), revertMsg);
            await expectRevert(assembly.appointDelegate(ZERO_ADDRESS), revertMsg);
            await expectRevert(assembly.expel(ZERO_ADDRESS), revertMsg);
            await expectRevert(assembly.claimSeat(0), revertMsg);
            await expectRevert(assembly.setSeatCount(0), revertMsg);
            await expectRevert(assembly.createTally(0), revertMsg);
            await expectRevert(assembly.castDelegateVote(0, true), revertMsg);
            await expectRevert(assembly.castCitizenVote(0, true), revertMsg);
            await expectRevert(assembly.tallyUp(0), revertMsg);
            await expectRevert(assembly.setVotingPercentThreshold(0), revertMsg);
            await expectRevert(assembly.setTallyDuration(0), revertMsg);
            await expectRevert(assembly.isQuorumReached(), revertMsg);
            await expectRevert(assembly.setQuorum(0), revertMsg);
            await expectRevert(assembly.claimRewards(), revertMsg);
            await expectRevert(assembly.setDelegationRewardRate(0), revertMsg);
            await expectRevert(assembly.setReferralRewardParams(0, 0), revertMsg);
            await expectRevert(assembly.claimReferralReward(ZERO_ADDRESS), revertMsg);
            await expectRevert(assembly.setExecRewardExponentMax(0), revertMsg);
        });


        it('Initialization params check', async () => {
            const o = roles.other;
            const i = new BN('1');
            await expectRevert(assembly.initialize(ZERO_ADDRESS, o, o, i, i, i, o, i, i, i, { from: roles.creator }), REVERT_MESSAGES.pohCannotZero);
            await expectRevert(assembly.initialize(o, ZERO_ADDRESS, o, i, i, i, o, i, i, i, { from: roles.creator }), REVERT_MESSAGES.ownerCannotZero);
            await expectRevert(assembly.initialize(o, o, ZERO_ADDRESS, i, i, i, o, i, i, i, { from: roles.creator }), REVERT_MESSAGES.walletCannotZero);
            await expectRevert(assembly.initialize(o, o, o, new BN('0'), i, i, o, i, i, i, { from: roles.creator }), REVERT_MESSAGES.invalidSeatCount);
            await expectRevert(assembly.initialize(o, o, o, i, i, i, ZERO_ADDRESS, i, i, i, { from: roles.creator }), REVERT_MESSAGES.faucetAddressCannotZero);
        });


        it('Initialize contracts', async () => {
            await initializeAll(poh, assembly, wallet, token, faucet, roles);

            expect(await assembly.getVotingPercentThreshold()).to.be.bignumber.equal(new BN(DEFAULT_THRESHOLD));
            expect(await assembly.getCreator()).to.be.equal(roles.creator);
            expect(await assembly.getSeatCount()).to.be.bignumber.equal(SEAT_COUNT);
            expect(await assembly.getQuorum()).to.be.bignumber.equal(CITIZEN_COUNT_QUORUM);
            expect(await assembly.getTallyDuration()).to.be.bignumber.equal(TALLY_DURATION);
            expect(await assembly.getPoh()).to.be.bignumber.equal(poh.address);
            expect(await assembly.getOwner()).to.be.bignumber.equal(wallet.address);
            expect(await assembly.getWallet()).to.be.bignumber.equal(wallet.address);
            expect(await assembly.getFaucet()).to.be.bignumber.equal(faucet.address);
            expect(await assembly.getDelegationRewardRate()).to.be.bignumber.equal(DELEGATION_REWARD_RATE);
            expect((await assembly.getReferralRewardParams())[0]).to.be.bignumber.equal(REFERRAL_REWARD);
            expect((await assembly.getReferralRewardParams())[1]).to.be.bignumber.equal(REFERRAL_REWARD);
            expect(await assembly.getExecRewardExponentMax()).to.be.bignumber.equal(EXEC_REWARD_EXPONENT_MAX);
        });

        it('Cannot initialize twice', async () => {
            await expectRevert(assembly.initialize(roles.other, roles.other, roles.other, 0, 0, 0, roles.other, 0, 0, 0),
                REVERT_MESSAGES.alreadyInitialized);
        });

        it('Only the owner can execute critical functions', async () => {
            const revertMsg = REVERT_MESSAGES.cannotDoThis;
            await expectRevert(assembly.distrust(roles.other, { from: roles.other }), revertMsg);
            await expectRevert(assembly.expel(roles.other, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setSeatCount(0, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setVotingPercentThreshold(0, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setTallyDuration(0, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setQuorum(0, { from: roles.other }), revertMsg);
            await expectRevert(assembly.upgradeTo(roles.other, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setDelegationRewardRate(0, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setReferralRewardParams(0, 0, { from: roles.other }), revertMsg);
            await expectRevert(assembly.setExecRewardExponentMax(0, { from: roles.other }), revertMsg);
        });
    });
}

contract('Assembly', function (accounts) {
    runAssemblyInitializationTests(artifacts, accounts);
});
