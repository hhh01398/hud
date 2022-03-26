const { expect } = require('chai');
const { artifacts } = require('hardhat');
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');

const NUM_ADDRESSES = 201;

const {
    getAccountRoles,
    deployPohOracle,
    initializePohOracle,
    createRandomAddress,
    pohRegisterBulk,
    SOME_UINT,
    REVERT_MESSAGES,
} = require('../scripts/common');

contract('Proof Of Humanity Oracle', function (accounts) {
    const roles = getAccountRoles(accounts);
    const updater = roles.operator;
    const upgrader = roles.upgrader;
    const other = roles.other;
    let poh;
    let submissionCounter;
    let ProofOfHumanityOracleUpgrade, pohUpgrade;
    let address;

    async function check(receipt, registered) {
        expectEvent(receipt, 'Update');
        expect(await poh.getLastUpdateTimestamp()).to.be.bignumber.equal(await time.latest());
        expect(await poh.isRegistered(address)).to.be.equal(registered);
    }

    describe('Initialization', async () => {
        before('Deployment', async () => {
            poh = await deployPohOracle(artifacts);
        });

        it('Can register/deregister address before initialization', async () => {
            address = createRandomAddress();

            await check(await poh.registerHuman(address, { from: updater }), true);
            await check(await poh.deregisterHuman(address, { from: updater }), false);
            await check(await poh.registerHumans([address], { from: updater }), true);
            await check(await poh.deregisterHumans([address], { from: updater }), false);
        });

        it('Can initialize', async () => {
            await initializePohOracle(poh, updater, upgrader);
            expect(await poh.getUpdater()).to.be.equal(updater);
            expect(await poh.getUpgrader()).to.be.equal(upgrader);
        });

        it('Cannot initialize twice', async () => {
            await expectRevert(poh.initialize(updater, upgrader), REVERT_MESSAGES.alreadyInitialized);
        });

        it('Only updater can register/deregister addresses after initialization', async () => {
            address = createRandomAddress();

            expect(await poh.isRegistered(address)).to.be.equal(false);

            await expectRevert(poh.registerHuman(address, { from: other }), REVERT_MESSAGES.notUpdater);
            await check(await poh.registerHuman(address, { from: updater }), true);

            await expectRevert(poh.deregisterHuman(address, { from: other }), REVERT_MESSAGES.notUpdater);
            await check(await poh.deregisterHuman(address, { from: updater }), false);

            await expectRevert(poh.registerHumans([address], { from: other }), REVERT_MESSAGES.notUpdater);
            await check(await poh.registerHumans([address], { from: updater }), true);

            await expectRevert(poh.deregisterHumans([address], { from: other }), REVERT_MESSAGES.notUpdater);
            await check(await poh.deregisterHumans([address], { from: updater }), false);
        });

        it('Register/deregister addresses in large bulks', async () => {
            let count = await poh.getHumanCount();
            const addresses = [...Array(NUM_ADDRESSES)].map(() => createRandomAddress());
            await pohRegisterBulk(poh, addresses, 100, updater);
            for (let i = 0; i < addresses.length; i++) {
                expect(await poh.isRegistered(addresses[i])).to.be.equal(true);
            }
            count = count.add(new BN(NUM_ADDRESSES));
            expect(await poh.getHumanCount()).to.be.bignumber.equal(count);
            await pohRegisterBulk(poh, addresses, 100, updater, { deregister: true });
            for (let i = 0; i < addresses.length; i++) {
                expect(await poh.isRegistered(addresses[i])).to.be.equal(false);
            }
            count = count.sub(new BN(NUM_ADDRESSES));
            expect(await poh.getHumanCount()).to.be.bignumber.equal(count);
        });

        it('Cannot change submission counter to the same value', async () => {
            submissionCounter = await poh.submissionCounter();
            await expectRevert(poh.setSubmissionCounter(submissionCounter, { from: updater }), REVERT_MESSAGES.newParameterValueMustDiff);
        });

        it('Can change submission counter', async () => {
            submissionCounter = await poh.submissionCounter();
            const newSubmissionCounter = submissionCounter.add(new BN('1'));
            const receipt = await poh.setSubmissionCounter(newSubmissionCounter, { from: updater });
            expectEvent(receipt, 'Update');
            expect(await poh.submissionCounter()).to.be.bignumber.equal(newSubmissionCounter);
        });
    });

    describe('Upgrade', async () => {
        before('Set up test scenario', async () => {
            ProofOfHumanityOracleUpgrade = artifacts.require('ProofOfHumanityOracleUpgrade');
            pohUpgrade = await ProofOfHumanityOracleUpgrade.new();
        });

        it('Only upgrader can upgrade', async () => {
            await expectRevert(poh.upgradeTo(pohUpgrade.address, { from: other }), REVERT_MESSAGES.notUpgrader);
        });

        it('Upgrade', async () => {
            await poh.upgradeTo(pohUpgrade.address, { from: upgrader });
            poh = await ProofOfHumanityOracleUpgrade.at(poh.address);

            // verify that the contract was upgraded
            expect(await poh.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));
        });
    });
});
