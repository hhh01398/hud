const { expect } = require('chai');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const TokenUpgrade = artifacts.require('TokenUpgrade');
const {
    getAccountRoles,
    deployToken,
    initializeToken,
    SOME_UINT,
    ZERO_ADDRESS,
    REVERT_MESSAGES
} = require('../scripts/common');

const {
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOKEN_SUPPLY,
    FAUCET_INITIAL_BALANCE,
} = require('../deployment-params');

contract('Token', function (accounts) {
    const roles = getAccountRoles(accounts);
    let token;

    describe('Deployment', async function () {
        it('Deploy', async function () {
            token = await deployToken(artifacts);
        });
    });

    describe('Initialization', async function () {
        it('Need to initialize first', async function () {
        });

        it('Validate initialization params', async () => {
            await expectRevert(initializeToken(token, '', '', [], 0, roles.wallet, roles.governor, roles.upgrader, roles.faucet, FAUCET_INITIAL_BALANCE), REVERT_MESSAGES.totalSupplyCannotZero);
            await expectRevert(initializeToken(token, '', '', [], TOKEN_SUPPLY, ZERO_ADDRESS, roles.governor, roles.upgrader, roles.faucet, FAUCET_INITIAL_BALANCE), REVERT_MESSAGES.reserveAddressCannotZero);
            await expectRevert(initializeToken(token, '', '', [], TOKEN_SUPPLY, roles.wallet, roles.governor, roles.upgrader, ZERO_ADDRESS, FAUCET_INITIAL_BALANCE), REVERT_MESSAGES.faucetAddressCannotZero);
            await expectRevert(initializeToken(token, '', '', [], TOKEN_SUPPLY, roles.wallet, roles.governor, roles.upgrader, roles.faucet, 0), REVERT_MESSAGES.faucetBalanceCannotZero);
        });

        it('Check initialization params', async () => {
            await initializeToken(token, TOKEN_NAME, TOKEN_SYMBOL, [], TOKEN_SUPPLY, roles.wallet, roles.governor, roles.upgrader, roles.faucet, FAUCET_INITIAL_BALANCE);

            expect(await token.name()).to.be.equal(TOKEN_NAME);
            expect(await token.symbol()).to.be.equal(TOKEN_SYMBOL);
            expect(await token.totalSupply()).to.be.bignumber.equal(TOKEN_SUPPLY);
            expect(await token.getReserve()).to.be.equal(roles.wallet);
            expect(await token.balanceOf(await token.getReserve())).to.be.bignumber.equal(TOKEN_SUPPLY.sub(FAUCET_INITIAL_BALANCE));
            expect(await token.balanceOf(roles.faucet)).to.be.bignumber.equal(FAUCET_INITIAL_BALANCE);
            expect(await token.getGovernor()).to.be.equal(roles.governor);
            expect(await token.getUpgrader()).to.be.equal(roles.upgrader);
        });

        it('Cannot initialize twice', async () => {
            await expectRevert(initializeToken(token, TOKEN_NAME, TOKEN_SYMBOL, [], TOKEN_SUPPLY, roles.wallet, roles.governor, roles.upgrader, roles.faucet, FAUCET_INITIAL_BALANCE), REVERT_MESSAGES.initializableAlready);
        });
    });

    describe('ERC777GovernedUpgradeable', async function () {
        let reserveAddress;
        const amount = new BN(1000);

        before('', async () => {
            reserveAddress = await token.getReserve();

            await token.governorSend(
                reserveAddress,
                roles.citizen1,
                amount,
                [], { from: roles.governor });

            await token.governorSend(
                reserveAddress,
                roles.citizen2,
                amount,
                [], { from: roles.governor });
        });

        describe('Governor-only actions', function () {
            describe('Transfer', function () {
                const otherAddress1 = '0x0000000000000000000000000000000000000001';
                const otherAddress2 = '0x0000000000000000000000000000000000000002';


                it('governor can transfer tokens from any address to any address', async () => {
                    expect(await token.balanceOf(otherAddress1)).to.be.bignumber.equal('0');
                    expect(await token.balanceOf(otherAddress2)).to.be.bignumber.equal('0');

                    await token.governorSend(
                        reserveAddress,
                        otherAddress1,
                        amount,
                        [], { from: roles.governor });

                    expect(await token.balanceOf(otherAddress1)).to.be.bignumber.equal(amount);

                    await token.governorSend(
                        otherAddress1,
                        otherAddress2,
                        amount,
                        [], { from: roles.governor });

                    expect(await token.balanceOf(otherAddress1)).to.be.bignumber.equal('0');
                    expect(await token.balanceOf(otherAddress2)).to.be.bignumber.equal(amount);
                });

                it('but non-governors are not allowed to do so', async () => {
                    await expectRevert(token.governorSend(
                        otherAddress2,
                        otherAddress1,
                        amount,
                        [], { from: roles.other }), REVERT_MESSAGES.onlyGovernor);
                });
            });

            describe('Block', function () {

                it('non-governor cannot block', async () => {
                    await expectRevert(token.blockAddress(roles.citizen1, { from: roles.citizen1 }), REVERT_MESSAGES.onlyGovernor);
                });

                it('can block', async () => {
                    expect(await token.isBlocked(roles.citizen1)).to.be.equal(false);
                    let receipt = await token.blockAddress(roles.citizen1, { from: roles.governor });
                    await expectEvent(receipt, 'Blocked', { account: roles.citizen1 });
                    expect(await token.isBlocked(roles.citizen1)).to.be.equal(true);

                    expect(await token.isBlocked(roles.citizen2)).to.be.equal(false);
                    receipt = await token.blockAddress(roles.citizen2, { from: roles.governor });
                    await expectEvent(receipt, 'Blocked', { account: roles.citizen2 });
                    expect(await token.isBlocked(roles.citizen2)).to.be.equal(true);

                    await expectRevert(token.transfer(roles.citizen3, 1, { from: roles.citizen1 }), REVERT_MESSAGES.senderAddressBlocked);
                    await expectRevert(token.transfer(roles.citizen2, 1, { from: roles.citizen3 }), REVERT_MESSAGES.recipientAddressBlocked);
                });

                it('cannot block if already blocked', async () => {

                    await expectRevert(token.blockAddress(roles.citizen1, { from: roles.governor }), REVERT_MESSAGES.addressBlocked);
                });

                it('governor can move funds among blocked addresses', async () => {

                    await token.governorSend(
                        roles.citizen2,
                        roles.citizen1,
                        1,
                        [], { from: roles.governor });
                });


                it('non-governor cannot unblock', async () => {
                    await expectRevert(token.unblockAddress(roles.citizen1, { from: roles.citizen1 }), REVERT_MESSAGES.onlyGovernor);
                });

                it('can unblock', async () => {
                    expect(await token.isBlocked(roles.citizen1)).to.be.equal(true);
                    expect(await token.isBlocked(roles.citizen2)).to.be.equal(true);
                    let receipt = await token.unblockAddress(roles.citizen1, { from: roles.governor });
                    await expectEvent(receipt, 'Unblocked', { account: roles.citizen1 });
                    receipt = await token.unblockAddress(roles.citizen2, { from: roles.governor });
                    await expectEvent(receipt, 'Unblocked', { account: roles.citizen2 });
                    expect(await token.isBlocked(roles.citizen1)).to.be.equal(false);
                    expect(await token.isBlocked(roles.citizen2)).to.be.equal(false);
                    await token.transfer(roles.citizen1, new BN('1'), { from: roles.citizen2 });
                });

                it('cannot unblock if not blocked', async () => {
                    await expectRevert(token.unblockAddress(roles.citizen3, { from: roles.governor }), REVERT_MESSAGES.addressNotBlocked);
                });
            });

        });

        describe('Burn', function () {
            const tokensToBurn = new BN('1');

            it('Can burn', async () => {
                const balanceBefore = await token.balanceOf(roles.citizen1);
                await token.burn(tokensToBurn, [], { from: roles.citizen1 });
                const balanceAfter = await token.balanceOf(roles.citizen1);
                expect(balanceBefore.sub(tokensToBurn)).to.be.bignumber.equal(balanceAfter);
            });
        });


        describe('Upgrade', function () {
            it('Only the upgrader can upgrade', async () => {
                const tokenUpgrade = await TokenUpgrade.new();
                await expectRevert(token.upgradeTo(tokenUpgrade.address, { from: roles.other }), REVERT_MESSAGES.notUpgrader);
            });

            it('Can upgrade', async () => {
                const reserveBalance = await token.balanceOf(reserveAddress);

                const tokenUpgrade = await TokenUpgrade.new();
                await token.upgradeTo(tokenUpgrade.address, { from: roles.upgrader });
                token = await TokenUpgrade.at(token.address);

                // verify that the contract was upgraded
                expect(await token.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));
                expect(await token.balanceOf(reserveAddress)).to.be.bignumber.equal(reserveBalance);
            });
        });
    });
});
