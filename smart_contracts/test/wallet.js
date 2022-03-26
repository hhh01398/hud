const { expect, assert } = require('chai')
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const WalletUpgrade = artifacts.require('WalletUpgrade')
const TestToken = artifacts.require('TestToken');

const {
    getAccountRoles,
    deployWalletTestable,
    initializeWallet,
    SOME_UINT,
    ZERO_ADDRESS,
    REVERT_MESSAGES
} = require('../scripts/common');
const { PRIORITY_HIGH } = require('constants');

const amount = new BN('1000');
const otherAddress = '0x1111111111111111111111111111111111111111';

let wallet;
let roles;
let proposalCount = new BN('0');

async function runTests() {
    let proposalId;
    let otherAddressBalance;

    it('Cannot initialize twice', async () => {
        await expectRevert(wallet.initialize(roles.other), REVERT_MESSAGES.alreadyInitialized);
    });

    it('Can deposit', async () => {
        expect(await web3.eth.getBalance(wallet.address)).to.be.bignumber.equal('0');
        const receipt = await web3.eth.sendTransaction({ to: wallet.address, value: amount, from: roles.other });
        assert.equal(receipt.logs.length, 1); // Deposited event emitted

        expect(await web3.eth.getBalance(wallet.address)).to.be.bignumber.equal(amount);
        otherAddressBalance = new BN(await web3.eth.getBalance(otherAddress));
    });

    it('Submit coin transaction proposal', async () => {
        expect(await wallet.getProposalCount()).to.be.bignumber.equal(proposalCount);
        const receipt = await wallet.submitProposal(otherAddress, amount, [], { from: roles.other });
        proposalId = new BN(proposalCount);
        expectEvent(receipt, 'Submitted', { proposalId: proposalId });
        proposalCount = proposalCount.add(new BN('1'));
        expect(await wallet.getProposalCount()).to.be.bignumber.equal(proposalCount);
    });

    it('Get proposal object', async () => {
        assert.equal(JSON.stringify(await wallet.getProposal(proposalId)), `["${otherAddress}","${amount}","0x",false]`);
    });

    it('Only the Assembly can execute a transaction proposal', async () => {
        await expectRevert(
            wallet.executeProposal(proposalId, { from: roles.other }),
            REVERT_MESSAGES.onlyAssembly);
    });

    it('Cannot execute a non-existing transaction proposal', async () => {
        await expectRevert(
            wallet.executeProposal(proposalId.add(new BN('1')), { from: roles.operator }),
            REVERT_MESSAGES.wrongProposalId);
    });

    it('Execute transaction proposal (execution successful)', async () => {
        receipt = await wallet.executeProposal(proposalId, { from: roles.operator });
        expectEvent(receipt, 'Called', { result: true });
        expectEvent(receipt, 'Executed', { proposalId: proposalId });
        otherAddressBalance = otherAddressBalance.add(amount);
        expect(await web3.eth.getBalance(otherAddress)).to.be.bignumber.equal(otherAddressBalance);
    });

    it('Cannot re-execute a transaction', async () => {
        await expectRevert(
            wallet.executeProposal(proposalId, { from: roles.operator }),
            'Proposed transaction was already executed');
    });

    it('Execute transaction proposal (execution failed)', async () => {
        await wallet.submitProposal(otherAddress, amount, [], { from: roles.other });
        proposalId = proposalId.add(new BN('1'));
        proposalCount = proposalCount.add(new BN('1'));

        receipt = await wallet.executeProposal(proposalId, { from: roles.operator });
        expectEvent(receipt, 'Called', { result: false });
        expectEvent(receipt, 'ExecutedFail', { proposalId: proposalId });
    });

    it('Transfer ERC20-like token', async () => {
        const token = await TestToken.new({ from: roles.other });

        expect(await token.balanceOf(wallet.address)).to.be.bignumber.equal('0');
        await token.transfer(wallet.address, amount, { from: roles.other });
        expect(await token.balanceOf(wallet.address)).to.be.bignumber.equal(amount);

        otherAddressBalance = await token.balanceOf(otherAddress);
        await wallet.submitProposal(token.address, 0, token.contract.methods.transfer(otherAddress, amount).encodeABI());
        proposalId = proposalId.add(new BN('1'));
        proposalCount = proposalCount.add(new BN('1'));
        await wallet.executeProposal(proposalId, { from: roles.operator });
        expect(await token.balanceOf(otherAddress)).to.be.bignumber.equal(otherAddressBalance.add(amount));
        expect(await token.balanceOf(wallet.address)).to.be.bignumber.equal('0');
    });

    it('Proposal count', async () => {
        expect(await wallet.getProposalCount()).to.be.bignumber.equal(proposalCount);
    });
}

contract('Wallet', function (accounts) {
    roles = getAccountRoles(accounts);

    it('Deploy', async function () {
        wallet = await deployWalletTestable(artifacts);
    });

    it('Operator cannot be 0x0', async function () {
        await expectRevert(wallet.initialize(ZERO_ADDRESS), REVERT_MESSAGES.assemblyCannotZero);
    });

    it('If not initialized, cannot submit a proposal', async () => {
        await expectRevert(wallet.submitProposal(otherAddress, amount, [], { from: roles.other }), REVERT_MESSAGES.notInitializedYed);
    });

    it('Initialize', async function () {
        await initializeWallet(wallet, roles.operator);
        await wallet.setTestMode(true); // Set contract in test mode

        expect(await wallet.getAssembly()).to.be.equal(roles.operator);
    });

    describe('Before upgrade', async function () {
        await runTests();
    });

    describe('Upgrade', async function () {
        it('Only the contract itself can upgrade', async () => {
            const walletUpgrade = await WalletUpgrade.new();
            await expectRevert(wallet.upgradeTo(walletUpgrade.address, { from: roles.operator }), REVERT_MESSAGES.cannotDoThis);
        });

        it('Can upgrade', async () => {
            const walletUpgrade = await WalletUpgrade.new();
            tx = await wallet.submitProposal(
                wallet.address,
                0,
                wallet.contract.methods.upgradeTo(walletUpgrade.address).encodeABI(),
                { from: roles.operator });
            const proposalId = tx.logs[0].args.proposalId.valueOf();
            proposalCount = proposalCount.add(new BN('1'));
            await wallet.executeProposal(proposalId, { from: roles.operator });
            wallet = await WalletUpgrade.at(wallet.address);

            // verify that the contract was upgraded
            expect(await wallet.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));
        });
    });

    describe('After upgrade', async function () {
        await runTests();
    });
});
