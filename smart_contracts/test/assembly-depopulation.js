const { expect } = require('chai');
const { BN, expectRevert, expectEvent, snapshot } = require('@openzeppelin/test-helpers');

const {
    getAccountRoles,
    deployAll,
    initializeAll,
    deployAssembly,
    initializeAssembly,
    buildSeatScenario,
    distrust,
    createTally,
    parseTally,
    createProposal,
    submitTransaction,
    ZERO_ADDRESS,
    REVERT_MESSAGES,
    TALLY_STATUS
} = require('../scripts/common');

async function runAssemblyDepopulationTests(artifacts, accounts) {
    const roles = getAccountRoles(accounts);

    let poh, assembly, wallet, token, faucet;
    let tallyId;
    let tallyBefore;
    let snapshotObj;

    const exCitizen = roles.citizen1;
    const exDelegate = roles.delegate1;

    async function setUpScenario() {
        [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: true });
        await initializeAll(poh, assembly, wallet, token, faucet, roles);
        await poh.setTestMode(true);
        await assembly.setTestMode(true);
        await buildSeatScenario(roles, poh, assembly);

        const proposalId = await createProposal(wallet, roles.delegate1);
        await submitTransaction(wallet,
            token.address,
            0,
            assembly.contract.methods.setReferralRewardParams(1, 1).encodeABI(),
            proposalId,
            0,
            roles.delegate1);
        await wallet.submitProposal(proposalId, { from: roles.delegate1 });

        tallyId = await createTally(assembly, proposalId, roles);
        await assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 });
        await assembly.castDelegateVote(tallyId, true, { from: roles.delegate2 });
        await assembly.tallyUp(tallyId);

        tallyBefore = parseTally(await assembly.getTally(tallyId));
        assert.equal(tallyBefore.status, TALLY_STATUS.ProvisionalApproved);
    }


    describe('Depopulation', async () => {
        describe('Revert cases', async () => {
            let assembly;

            before('Set up scenario', async () => {
                assembly = await deployAssembly(artifacts);
                await initializeAssembly(assembly, roles.other, roles.owner, roles.other, roles.other, roles);
            });

            it('Only owner can distrust and expel', async () => {
                await expectRevert(assembly.distrust(roles.citizen1, { from: roles.other }), REVERT_MESSAGES.cannotDoThis);
                await assembly.distrust(roles.citizen1, { from: roles.owner })
                await expectRevert(assembly.expel(roles.citizen1, { from: roles.other }), REVERT_MESSAGES.cannotDoThis);
            });
        });

        describe('Citizen', async () => {
            before('Set up scenario', async () => {
                await setUpScenario();
                snapshotObj = await snapshot();
            });

            it('Cannot expel without being distrusted first', async () => {
                await expectRevert(assembly.expel(exDelegate, { from: roles.owner }), REVERT_MESSAGES.cannotExpel);
                await expectRevert(assembly.expel(exCitizen, { from: roles.owner }), REVERT_MESSAGES.cannotExpel);
            });

            it('Can be expelled if humanity proof no longer valid', async () => {
                expect(await assembly.isCitizen(exCitizen)).to.be.equal(true);
                const citizenCount = await assembly.getCitizenCount();
                const delegate = await assembly.getAppointedDelegate({ from: exCitizen });
                const appointmentCount = await assembly.getAppointmentCount(delegate);

                await poh.deregisterHuman(exCitizen);
                const receipt = await assembly.expel(exCitizen);
                expectEvent(receipt, 'Expelled', { member: exCitizen });
                expect(await assembly.isCitizen(exCitizen)).to.be.equal(false);

                expect(await assembly.getCitizenCount()).to.be.bignumber.equal(citizenCount.sub(new BN('1')));
                expect(await assembly.getAppointedDelegate({ from: exCitizen })).to.be.bignumber.equal(ZERO_ADDRESS);
                expect(await assembly.getAppointmentCount(delegate)).to.be.bignumber.equal(appointmentCount.sub(new BN('1')));
            });

            it('Citizen votes are removed', async () => {
                await assembly.tallyUp(tallyId);
                tally = parseTally(await assembly.getTally(tallyId));
                expect(tally.delegatedYays).to.be.bignumber.equal(tallyBefore.delegatedYays.sub(new BN('1')));
                expect(tally.citizenCount).to.be.bignumber.equal(tallyBefore.citizenCount.sub(new BN('1')));
                assert.equal(tally.status, TALLY_STATUS.ProvisionalNotApproved);
            });
        });

        describe('Delegate', async () => {
            before('Set up scenario', async () => {
                await snapshotObj.restore();
            });

            it('Can be expelled for being distrusted', async () => {
                expect(await assembly.isDelegate(exDelegate)).to.be.equal(true);
                const delegateCount = await assembly.getDelegateCount();
                await assembly.distrust(exDelegate, { from: roles.owner })
                receipt = await assembly.expel(exDelegate);
                expectEvent(receipt, 'Expelled', { member: exDelegate });
                expect(await assembly.isDelegate(exDelegate)).to.be.equal(false);
                expect(await assembly.getDelegateCount()).to.be.bignumber.equal(delegateCount.sub(new BN('1')));
            });

            it('Delegated votes are removed', async () => {
                await assembly.claimSeat(await assembly.getDelegateSeat(exDelegate), { from: roles.delegate3 });
                await assembly.tallyUp(tallyId);
                tally = parseTally(await assembly.getTally(tallyId));
                expect(tally.delegatedYays).to.be.bignumber.equal(tallyBefore.delegatedYays.sub(await assembly.getAppointmentCount(exDelegate)));
                assert.equal(tally.status, TALLY_STATUS.ProvisionalNotApproved);
            });
        });
    });
}

contract('Assembly', function (accounts) {
    runAssemblyDepopulationTests(artifacts, accounts);
});
