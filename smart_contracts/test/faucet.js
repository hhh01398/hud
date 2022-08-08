const { expect } = require('chai');
const { artifacts } = require('hardhat');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');

const {
    getAccountRoles,
    deployToken,
    deployFaucet,
    initializeToken,
    initializeFaucet,
    SOME_UINT,
    ZERO_ADDRESS,
    REVERT_MESSAGES,
} = require('../scripts/common');

const {
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOKEN_SUPPLY,
    FAUCET_INITIAL_BALANCE,
} = require('../deployment-params');

contract('Faucet', function (accounts) {
    const roles = getAccountRoles(accounts);
    let faucet, token;
    let FaucetUpgrade, faucetUpgrade;
    const ADDR = roles.other;

    describe('Initialization', async () => {
        before('Set up test scenario', async () => {
            faucet = await deployFaucet(artifacts);
            token = await deployToken(artifacts);
            await initializeToken(token, TOKEN_NAME, TOKEN_SYMBOL, [], TOKEN_SUPPLY, roles.wallet, roles.governor, roles.upgrader, faucet.address, FAUCET_INITIAL_BALANCE);
        });

        it('Must initialize first', async () => {
            await expectRevert(faucet.send(ADDR, 1, []), REVERT_MESSAGES.notInitializedYet);
        });

        it('Validation of initialization arguments', async () => {
            await expectRevert(initializeFaucet(faucet, ZERO_ADDRESS, roles.wallet, token.address, roles.upgrader), REVERT_MESSAGES.assemblyCannotZero);
            await expectRevert(initializeFaucet(faucet, roles.assembly, ZERO_ADDRESS, token.address, roles.upgrader), REVERT_MESSAGES.walletCannotZero);
            await expectRevert(initializeFaucet(faucet, roles.assembly, roles.wallet, ZERO_ADDRESS, roles.upgrader), REVERT_MESSAGES.tokenCannotZero);
            await expectRevert(initializeFaucet(faucet, roles.assembly, roles.wallet, token.address, ZERO_ADDRESS), REVERT_MESSAGES.upgraderCannotZero);
        });

        it('Can initialize', async () => {
            await initializeFaucet(faucet, roles.assembly, roles.wallet, token.address, roles.upgrader);

            expect(await faucet.getToken()).to.be.equal(token.address);
            expect(await faucet.getAssembly()).to.be.equal(roles.assembly);
            expect(await faucet.getWallet()).to.be.equal(roles.wallet);
            expect(await faucet.getUpgrader()).to.be.equal(roles.upgrader);
        });

        it('Cannot initialize twice', async () => {
            await expectRevert(initializeFaucet(faucet, roles.assembly, roles.wallet, token.address, roles.upgrader), REVERT_MESSAGES.alreadyInitialized);
        });
    });

    describe('Transfer', async () => {
        const amount = new BN('2');
        const amount2 = new BN('1');

        before('Set up test scenario', async () => {
            expect(await token.balanceOf(faucet.address)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE);
            await token.governorSend(await token.getReserve(), faucet.address, amount, [], { from: roles.governor });
            expect(await token.balanceOf(faucet.address)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE.add(amount));
        });

        it('Only governor can send', async () => {
            await expectRevert(faucet.send(ADDR, amount2, [], { from: roles.other }), REVERT_MESSAGES.cannotDoThis);
        });

        it('Assembly sends tokens', async () => {
            expect(await token.balanceOf(ADDR)).to.be.bignumber.equal('0');
            expect(await token.balanceOf(faucet.address)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE.add(amount));
            const receipt = await faucet.send(ADDR, amount2, [], { from: roles.assembly });
            expect(await token.balanceOf(ADDR)).to.be.bignumber.equal(amount2);
            expect(await token.balanceOf(faucet.address)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE.add(amount).sub(amount2));
        });

        it('Wallet sends tokens', async () => {
            expect(await token.balanceOf(ADDR)).to.be.bignumber.equal(amount2);
            expect(await token.balanceOf(faucet.address)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE.add(amount).sub(amount2));
            const receipt = await faucet.send(ADDR, amount2, [], { from: roles.wallet });
            expect(await token.balanceOf(ADDR)).to.be.bignumber.equal(amount);
            expect(await token.balanceOf(faucet.address)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE);
        });
    });

    describe('Upgrade', async () => {
        before('Set up test scenario', async () => {
            FaucetUpgrade = artifacts.require('FaucetUpgrade');
            faucetUpgrade = await FaucetUpgrade.new();
        });

        it('Only upgrader can upgrade', async () => {
            await expectRevert(faucet.upgradeTo(faucetUpgrade.address, { from: roles.other }), REVERT_MESSAGES.notUpgrader);
        });

        it('Upgrade', async () => {
            await faucet.upgradeTo(faucetUpgrade.address, { from: roles.upgrader });
            faucet = await FaucetUpgrade.at(faucet.address);

            // verify that the contract was upgraded
            expect(await faucet.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));
        });
    });
});
