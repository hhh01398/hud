const { BN, time, expectRevert, expectEvent, snapshot } = require('@openzeppelin/test-helpers');
const AssemblyUpgrade = artifacts.require('AssemblyUpgrade');
const {
    getAccountRoles,
    deployAll,
    deployAssembly,
    initializeAll,
    initializeAssembly,
    buildPopulationScenario,
    buildSeatScenario,
    parseTally,
    validateTallyState,
    makeMap,
    REVERT_MESSAGES,
    ZERO_ADDRESS,
    SOME_UINT,
} = require('../scripts/common');

async function runAssemblyEvolutionTests(artifacts, accounts) {
    const roles = getAccountRoles(accounts);
    let poh, assembly, wallet, token, faucet;

    describe('Evolution', async () => {
        let snaphotTallyStarted;
        let tallyId;

        async function createTestTransaction() {
            return token.contract.methods.governorSend(
                await token.getReserve(),
                ZERO_ADDRESS,
                1,
                [],
            ).encodeABI();
        }

        async function isTestTransactionEnacted() {
            return (await token.balanceOf(ZERO_ADDRESS)).eq(new BN('1'));
        }

        describe('Seats', async () => {
            before('Set up scenario', async () => {
                [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: true });
                await initializeAll(poh, assembly, wallet, token, faucet, roles);
                await poh.setTestMode(true);
                await buildPopulationScenario(roles, poh, assembly);
                await assembly.setTestMode(true);
            });

            it('Delegates can claim seats', async () => {
                expect(await assembly.isDelegateSeated(roles.delegate1)).to.be.equal(false);

                seatNumber = new BN('0');
                receipt = await assembly.claimSeat(seatNumber, { from: roles.delegate1 });

                expectEvent(receipt, 'DelegateSeatUpdate', { seatNumber: seatNumber, delegate: roles.delegate1 });
                expect(await assembly.isDelegateSeated(roles.delegate1)).to.be.equal(true);
                expect(await assembly.getDelegateSeat(roles.delegate1)).to.be.bignumber.equal(seatNumber);


                seatNumber = new BN('1');
                receipt = await assembly.claimSeat(1, { from: roles.delegate2 });
                expectEvent(receipt, 'DelegateSeatUpdate', { seatNumber: seatNumber, delegate: roles.delegate2 });

                assert.equal(
                    JSON.stringify(makeMap(await assembly.getDelegateSeatAppointmentCounts())),
                    `{"${roles.delegate1}":"2","${roles.delegate2}":"1"}`,
                );
            });

            it("Cannot claim someone else's seat if not enough citizens support you", async () => {
                await expectRevert(assembly.claimSeat(0, { from: roles.delegate3 }), 'Not enought citizens support the delegate');
            });

            it('Cannot claim a seat number greater or equal than the number of seats', async () => {
                await expectRevert(assembly.claimSeat(await assembly.getSeatCount(), { from: roles.delegate3 }), REVERT_MESSAGES.wrongSeat);
            });

            it('Delegates with a seat cannot claim a seat again', async () => {
                await expectRevert(assembly.claimSeat(0, { from: roles.delegate1 }), REVERT_MESSAGES.alreadySeated);
            });

            it("Claiming the seat of a delegate whose humanity has been challenged", async () => {
                const exDelegate = roles.delegate2;
                const exDelegateSeat = await assembly.getDelegateSeat(exDelegate);
                const newSeatedDelegate = roles.delegate3;
                await poh.deregisterHuman(exDelegate);
                await assembly.expel(exDelegate);

                expect(await assembly.isDelegateSeated(exDelegate)).to.be.equal(true);
                expect(await assembly.isDelegateSeated(newSeatedDelegate)).to.be.equal(false);

                const receipt = await assembly.claimSeat(exDelegateSeat, { from: newSeatedDelegate });
                expectEvent(receipt, 'DelegateSeatUpdate', { seatNumber: exDelegateSeat, delegate: newSeatedDelegate });

                expect(await assembly.isDelegateSeated(exDelegate)).to.be.equal(false);
                expect(await assembly.isDelegateSeated(newSeatedDelegate)).to.be.equal(true);
                expect(await assembly.getDelegateSeat(newSeatedDelegate)).to.be.bignumber.equal(exDelegateSeat);
            });
        });

        describe('Creating tally', async () => {

            before('Set up scenario', async () => {
                [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: true });
                await initializeAll(poh, assembly, wallet, token, faucet, roles);
                await poh.setTestMode(true);
                await buildSeatScenario(roles, poh, assembly);
            });

            it('Only trusted addresses can submit a transaction proposal', async () => {
                await wallet.setTestMode(false);

                assert.equal(await assembly.isTrusted(roles.other), false);
                await expectRevert(
                    wallet.submitProposal(
                        token.address,
                        0,
                        await createTestTransaction(), { from: roles.other }),
                    REVERT_MESSAGES.notTrusted);

                await wallet.setTestMode(true);
            });

            it('Only trusted addresses can create a tally', async () => {
                assert.equal(await assembly.isTrusted(roles.other), false);
                await expectRevert(assembly.createTally(0, { from: roles.other }), REVERT_MESSAGES.notTrusted);
            });

            it('Cannot create tally of inexisting proposals', async () => {
                await expectRevert(assembly.createTally(9999, { from: roles.delegate1 }), REVERT_MESSAGES.wrongProposalId);
            });

            it('Can create tally', async () => {
                assert.equal(await isTestTransactionEnacted(), false);
                receipt = await wallet.submitProposal(
                    token.address,
                    0,
                    await createTestTransaction(), { from: roles.delegate1 });
                const proposalId = receipt.logs[0].args.proposalId.valueOf();
                receipt = await assembly.createTally(proposalId, { from: roles.delegate1 });
                tallyId = receipt.logs[0].args.tallyId.valueOf();
                expect(await assembly.getTallyCount()).to.be.bignumber.equal('1');
                await validateTallyState(roles, assembly, tallyId, 'initial');

                const tally = parseTally(await assembly.getTally(tallyId));
                expect(tally.proposalId).to.be.bignumber.equal(proposalId);
                const tallyDuration = new BN(tally.votingEndTime).sub(new BN(tally.submissionTime));
                expect(new BN(tally.revocationStartTime)).to.be.bignumber.equal((new BN(tally.submissionTime)).add((new BN(tallyDuration)).div(new BN('2'))));
                expect(new BN(tally.votingEndTime)).to.be.bignumber.equal((new BN(tally.revocationStartTime)).add((new BN(tallyDuration)).div(new BN('2'))));
                expect(new BN(tally.citizenCount)).to.be.bignumber.equal(await assembly.getCitizenCount());
            });

            after('Take snapshot', async () => {
                snaphotTallyStarted = await snapshot();
            });
        });

        describe('Voting flow', async () => {
            before('Restore snapshot', async () => {
                await snaphotTallyStarted.restore()
            });

            it('Votes from a delegate without a seat are not counted', async () => {
                await validateTallyState(roles, assembly, tallyId, 'initial');
                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate3 });
                await validateTallyState(roles, assembly, tallyId, 'initial');
            });

            it('Delegate cannot vote the same again', async () => {
                await validateTallyState(roles, assembly, tallyId, 'initial');
                await expectRevert(assembly.castDelegateVote(tallyId, false, { from: roles.delegate1 }), REVERT_MESSAGES.voteAlready);
                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 });
                await validateTallyState(roles, assembly, tallyId, 'delegate1yay');
                await expectRevert(assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 }), REVERT_MESSAGES.voteAlready);
            });

            it('Delegates wanting to vote nay should just not vote instead', async () => {
                await expectRevert(assembly.castDelegateVote(tallyId, false, { from: roles.delegate2 }), REVERT_MESSAGES.voteAlready);
            });

            it('Delegates can approve a proposal', async () => {
                await validateTallyState(roles, assembly, tallyId, 'delegate1yay');
                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate2 });
                await validateTallyState(roles, assembly, tallyId, 'delegates12yays');
            });

            it('Tally cannot be enacted if not finally approved first', async () => {
                await expectRevert(assembly.enact(tallyId), REVERT_MESSAGES.proposalNotApprovedOrEnacted);
            });

            it('Delegates cannot vote during the revocation phase', async () => {
                await validateTallyState(roles, assembly, tallyId, 'delegates12yays');
                const tally = parseTally(await assembly.getTally(tallyId));
                await time.increaseTo(tally.revocationStartTime + 1);
                await expectRevert(assembly.castDelegateVote(tallyId, false, { from: roles.delegate1 }), REVERT_MESSAGES.delegatesNoVoteRevokation);
                await validateTallyState(roles, assembly, tallyId, 'delegates12yays_revocation');
            });

            it('Citizens cannot vote twice for the same', async () => {
                await validateTallyState(roles, assembly, tallyId, 'delegates12yays_revocation');
                await assembly.castCitizenVote(tallyId, false, { from: roles.citizen1 });
                await validateTallyState(roles, assembly, tallyId, 'delegates12yaysCitizen1nay');
                await expectRevert(assembly.castCitizenVote(tallyId, false, { from: roles.citizen1 }), REVERT_MESSAGES.voteAlready);
            });

            it('Cannot set tally to final status if no quorum', async () => {
                await validateTallyState(roles, assembly, tallyId, 'delegates12yaysCitizen1nay');
                const tally = parseTally(await assembly.getTally(tallyId));
                await time.increaseTo(tally.votingEndTime + 1);
                await expectRevert(assembly.tallyUp(tallyId, { from: roles.other }), REVERT_MESSAGES.cannotEndQuorum);
            });

            it('Creator can circumvent quorum restriction', async () => {
                await assembly.tallyUp(tallyId, { from: roles.creator })
                await validateTallyState(roles, assembly, tallyId, 'delegates12yaysCitizen1nay_ended', doTallyUp = false);
            });

            it('Cannot cast vote on an ended tally', async () => {
                await expectRevert(assembly.castDelegateVote(tallyId, false, { from: roles.delegate1 }), REVERT_MESSAGES.votingEnded);
                await expectRevert(assembly.castCitizenVote(tallyId, false, { from: roles.citizen1 }), REVERT_MESSAGES.votingEnded);
            });

            it('Can enact approved proposal', async () => {
                const receipt = await assembly.enact(tallyId, { from: roles.other });
                expectEvent(receipt, 'Enacted', { tallyId: tallyId });
            });

        });

        describe('Revocation', async () => {
            beforeEach('Restore snapshot', async () => {
                await snaphotTallyStarted.restore()
                await assembly.setTestMode(true);
            });

            it('Scenario #1: Delegates approve but citizens do not approve', async () => {
                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 });
                await assembly.castDelegateVote(tallyId, true, { from: roles.delegate2 });
                await validateTallyState(roles, assembly, tallyId, 'delegates12yays');
                const tally = parseTally(await assembly.getTally(tallyId));
                await time.increaseTo(tally.revocationStartTime + 1);
                await validateTallyState(roles, assembly, tallyId, 'delegates12yays_revocation');
                await assembly.castCitizenVote(tallyId, false, { from: roles.citizen1 });
                await assembly.castCitizenVote(tallyId, false, { from: roles.citizen3 });
                await assembly.castCitizenVote(tallyId, false, { from: roles.citizen4 });
                await validateTallyState(roles, assembly, tallyId, 'delegates12yaysCitizens145nays');
                await time.increaseTo(tally.votingEndTime + 1);
                await validateTallyState(roles, assembly, tallyId, 'delegates12yaysCitizens145nays_ended');
            });

            it('Scenario #2: Delegates do not approve but citizens approve', async () => {
                const tally = parseTally(await assembly.getTally(tallyId));
                await time.increaseTo(tally.revocationStartTime + 1);
                await validateTallyState(roles, assembly, tallyId, 'novotes_revocation');
                await assembly.castCitizenVote(tallyId, true, { from: roles.citizen1 });
                await assembly.castCitizenVote(tallyId, true, { from: roles.citizen3 });
                await assembly.castCitizenVote(tallyId, true, { from: roles.citizen4 });
                await validateTallyState(roles, assembly, tallyId, 'citizens145yays');
                await time.increaseTo(tally.votingEndTime + 1);
                await validateTallyState(roles, assembly, tallyId, 'citizens145yays_ended');
            });
        });

        describe('Upgrade', async function () {
            let assembly;

            before('Set up test scenario', async () => {
                assembly = await deployAssembly(artifacts);
                await initializeAssembly(assembly, roles.other, roles.owner, roles.other, roles.other, roles);
            });

            it('Only the upgrader can upgrade', async () => {
                const assemblyUpgrade = await AssemblyUpgrade.new();
                await expectRevert(wallet.upgradeTo(assemblyUpgrade.address, { from: roles.other }), REVERT_MESSAGES.cannotDoThis);
            });

            it('Can upgrade', async () => {
                const assemblyUpgrade = await AssemblyUpgrade.new();

                await assembly.upgradeTo(assemblyUpgrade.address, { from: roles.owner })
                assembly = await AssemblyUpgrade.at(assembly.address);

                // verify that the contract was upgraded
                expect(await assembly.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));
            });
        });
    });
}

contract('Assembly', function (accounts) {
    runAssemblyEvolutionTests(artifacts, accounts);
});
