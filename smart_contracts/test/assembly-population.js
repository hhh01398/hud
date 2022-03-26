

const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

const {
    getAccountRoles,
    deployAll,
    initializeAll,
    REVERT_MESSAGES,
} = require('../scripts/common');

async function runAssemblyPopulationTests(artifacts, accounts) {
    const roles = getAccountRoles(accounts);
    let poh, assembly, wallet, token, faucet;

    describe('Population', async () => {
        before('Set up test scenario', async () => {
            [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, {testable: true});
            await initializeAll(poh, assembly, wallet, token, faucet, roles);
            await poh.setTestMode(true);
        });

        describe('Delegation', async () => {
            it('Delegates need to be humans', async () => {
                expect(await assembly.isHuman(roles.delegate1)).to.be.equal(false);
                expect(await assembly.isDelegate(roles.delegate1)).to.be.equal(false);
                await expectRevert(assembly.applyForDelegation({ from: roles.delegate1 }), REVERT_MESSAGES.notHuman);

            });

            it('Can become a delegate', async () => {
                const delegateCount = await assembly.getDelegateCount();
                await poh.registerHuman(roles.delegate1);
                expect(await assembly.isHuman(roles.delegate1)).to.be.equal(true);
                expect(await assembly.isDelegate(roles.delegate1)).to.be.equal(false);
                const receipt = await assembly.applyForDelegation({ from: roles.delegate1 });
                expectEvent(receipt, 'DelegateApplication', { delegate: roles.delegate1, numDelegates: delegateCount.add(new BN(1)) });
                expect(await assembly.isDelegate(roles.delegate1)).to.be.equal(true);
                expect(await assembly.getDelegateCount()).to.be.bignumber.equal(delegateCount.add(new BN('1')));
            });

            it('Cannot apply for delegate if already a delegate', async () => {
                await expectRevert(assembly.applyForDelegation({ from: roles.delegate1 }), REVERT_MESSAGES.delegateAlready);
            });
        });

        describe('Citizenship', async () => {
            it('Citizens need to be humans', async () => {
                expect(await assembly.isHuman(roles.citizen1)).to.be.equal(false);
                expect(await assembly.isCitizen(roles.citizen1)).to.be.equal(false);
                await expectRevert(assembly.applyForCitizenship({ from: roles.citizen1 }), REVERT_MESSAGES.notHuman);
            });

            it('Can become a citizen', async () => {
                const citizenCount = await assembly.getCitizenCount();
                await poh.registerHuman(roles.citizen1);
                expect(await assembly.isHuman(roles.citizen1)).to.be.equal(true);
                expect(await assembly.isCitizen(roles.citizen1)).to.be.equal(false);
                const receipt = await assembly.applyForCitizenship({ from: roles.citizen1 });
                expectEvent(receipt, 'CitizenApplication', { citizen: roles.citizen1, numCitizens: citizenCount.add(new BN(1)) });
                expect(await assembly.isCitizen(roles.citizen1)).to.be.equal(true);
                expect(await assembly.getCitizenCount()).to.be.bignumber.equal(citizenCount.add(new BN('1')));
            });
        })

        describe('Appointment', async () => {
            it('Cannot appoint a non-delegate', async () => {
                await expectRevert(assembly.appointDelegate(roles.citizen1, { from: roles.citizen1 }), REVERT_MESSAGES.notBelongToDelegate);
            });

            it('Can appoint a delegate', async () => {
                const appointmentCount = await assembly.getAppointmentCount(roles.delegate1);
                const receipt = await assembly.appointDelegate(roles.delegate1, { from: roles.citizen1 });
                expectEvent(receipt, 'AppointDelegate', { delegate: roles.delegate1, citizen: roles.citizen1 });
                expect(await assembly.getAppointmentCount(roles.delegate1)).to.be.bignumber.equal(appointmentCount.add(new BN('1')));
            });

            it('Cannot appoint the same delegate more than once', async () => {
                await expectRevert(assembly.appointDelegate(roles.delegate1, { from: roles.citizen1 }), REVERT_MESSAGES.alreadyAppointedDelegate);
            });
        });
    });
}

contract('Assembly', function (accounts) {
    runAssemblyPopulationTests(artifacts, accounts);
});
