const { expect, assert } = require('chai')
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const WalletUpgrade = artifacts.require('WalletUpgrade')
const TestToken = artifacts.require('TestToken');

const {
    getAccountRoles,
    deployWalletTestable,
    initializeWallet,
    createProposal,
    submitTransaction,
    PROPOSAL_STATUS,
    SOME_UINT,
    ZERO_ADDRESS,
    REVERT_MESSAGES
} = require('../scripts/common');
const amount = new BN('1000');
const otherAddress = '0x1111111111111111111111111111111111111111';

let wallet, token, creator, assembly, other;
let walletBalance;

async function checkTransaction(transactionId, destination, amount, data, executed) {
    function generateGetTransactionOutput(destination, amount, data, executed) {
        return `["${otherAddress}","${amount}","0x${data.toString(16)}",${executed}]`;
    }

    assert.equal(JSON.stringify(await wallet.getTransaction(transactionId)), generateGetTransactionOutput(destination, amount, data, executed));
}


async function checkProposal(proposalId, status, executedSteps, transactionIds) {
    function generateGetProposalOutput(status, executedSteps, transactionIds) {
        const j = {};

        j['0'] = status.toString(16);
        j['1'] = executedSteps.toString(16);
        j['2'] = [];

        for (let s = 0; s < transactionIds.length; s++) {
            ss = [];
            for (let t = 0; t < transactionIds[s].length; t++) {
                ss.push(transactionIds[s][t].toString(16));
            }
            j['2'].push(ss);
        }
        return j;
    }

    const proposalExpected = generateGetProposalOutput(status, executedSteps, transactionIds);
    assert.equal(JSON.stringify(await wallet.getProposal(proposalId)), JSON.stringify(proposalExpected));
}

async function runGeneralTests() {
    let proposalId;
    let otherAddressBalance;

    describe('General tests', async () => {

        it('Cannot initialize twice', async () => {
            await expectRevert(wallet.initialize(assembly), REVERT_MESSAGES.alreadyInitialized);
        });

        it('Can deposit', async () => {
            const balanceBefore = new BN(await web3.eth.getBalance(wallet.address));
            const receipt = await web3.eth.sendTransaction({ to: wallet.address, value: amount, from: other });
            assert.equal(receipt.logs.length, 1); // Deposited event emitted

            expect((new BN(await web3.eth.getBalance(wallet.address))).sub(balanceBefore)).to.be.bignumber.equal(amount);
            otherAddressBalance = new BN(await web3.eth.getBalance(otherAddress));
        });

        it('Must create proposal before submitting it', async () => {
            const proposalCount = await wallet.getProposalCount();
            await expectRevert(wallet.submitProposal(proposalCount, { from: creator }),
                REVERT_MESSAGES.wrongProposalId);
        });

        it('Can create proposals', async () => {
            const proposalCount = await wallet.getProposalCount();
            const receipt = await wallet.createProposal({ from: creator });
            proposalId = receipt.logs[0].args.proposalId.valueOf();
            expect(proposalId).to.be.bignumber.equal(proposalCount);
            expectEvent(receipt, 'ProposalCreated', { proposalId: proposalId });
        });

        it('Cannot submit empty proposals', async () => {
            await expectRevert(wallet.submitProposal(proposalId, { from: creator }),
                REVERT_MESSAGES.emptyProposal);
        });

        it('Cannot create empty steps', async () => {
            await expectRevert(wallet.submitTransaction(otherAddress, new BN('1'), [], proposalId, new BN('1'), { from: creator }),
                REVERT_MESSAGES.needToFillEmptyStepsFirst);
        });

        it('Cannot allocate transactions to inexisting proposals', async () => {
            const proposalCount = await wallet.getProposalCount();
            await expectRevert(wallet.submitTransaction(otherAddress, new BN('1'), [], proposalCount, new BN('1'), { from: creator }),
                REVERT_MESSAGES.wrongProposalId);
        });

        it('Cannot execute proposals which are not yet submitted', async () => {
            await expectRevert(
                wallet.executeProposal(proposalId, { from: assembly }),
                REVERT_MESSAGES.wrongProposalStatus);
        });

        it('Only the creator can submit transactions or the proposal', async () => {
            await expectRevert(
                wallet.submitTransaction(otherAddress, amount, [], proposalId, new BN('1'), { from: other }),
                REVERT_MESSAGES.proposalOnlyCreator);

            await expectRevert(
                wallet.submitProposal(proposalId, { from: other }),
                REVERT_MESSAGES.proposalOnlyCreator);
        });

        it('Can allocate transactions to proposal steps', async () => {
            let transactionId = await wallet.getTransactionCount();
            const receipt = await wallet.submitTransaction(otherAddress, amount, [], proposalId, new BN('0'), { from: creator });
            expectEvent(receipt, 'TransactionSubmitted', { transactionId: transactionId, proposalId: proposalId, stepNum: new BN('0') });
        });

        it('Can submit proposal', async () => {
            const receipt = await wallet.submitProposal(proposalId, { from: creator });
            expectEvent(receipt, 'ProposalSubmitted', { proposalId: proposalId, stepsCount: new BN('1') });
        });

        it('Cannot change proposal once submitted', async () => {
            await expectRevert(
                wallet.submitTransaction(otherAddress, amount, [], proposalId, new BN('1'), { from: creator }),
                REVERT_MESSAGES.proposalCannotChange);
        });

        it('Only the Assembly can execute a proposal', async () => {
            await expectRevert(
                wallet.executeProposal(proposalId, { from: other }),
                REVERT_MESSAGES.onlyAssembly);
        });

        it('Cannot execute a non-existing proposal', async () => {
            await expectRevert(
                wallet.executeProposal(proposalId.add(new BN('1')), { from: assembly }),
                REVERT_MESSAGES.wrongProposalId);
        });

        it('Execute proposal (execution successful)', async () => {
            receipt = await wallet.executeProposal(proposalId, { from: assembly });
            expectEvent(receipt, 'Called', { result: true });
            expectEvent(receipt, 'ProposalFullyExecuted', { proposalId: proposalId });
            otherAddressBalance = otherAddressBalance.add(amount);
            expect(await web3.eth.getBalance(otherAddress)).to.be.bignumber.equal(otherAddressBalance);
        });

        it('Cannot change proposal once submitted and executed', async () => {
            await expectRevert(
                wallet.submitTransaction(otherAddress, amount, [], proposalId, new BN('1'), { from: creator }),
                REVERT_MESSAGES.proposalCannotChange);
        });

        it('Cannot re-execute a proposal', async () => {
            await expectRevert(
                wallet.executeProposal(proposalId, { from: assembly }), REVERT_MESSAGES.proposalFullyExecuted);
        });

        it('Cannot re-submit a proposal', async () => {
            await expectRevert(
                wallet.submitProposal(proposalId, { from: creator }), REVERT_MESSAGES.wrongProposalStatus);
        });

        it('Execute transaction proposal (execution failed)', async () => {
            receipt = await wallet.createProposal({ from: creator });
            proposalId = receipt.logs[0].args.proposalId.valueOf();
            receipt = await wallet.submitTransaction(otherAddress, amount, [], proposalId, new BN('0'), { from: creator });
            transactionId = receipt.logs[0].args.transactionId.valueOf();

            await wallet.submitProposal(proposalId, { from: creator });

            await expectRevert(
                wallet.executeProposal(proposalId, { from: assembly }),
                REVERT_MESSAGES.proposalStepNotExecuted);
        });

        it('Transfer ERC20-like token', async () => {
            expect(await token.balanceOf(wallet.address)).to.be.bignumber.equal('0');
            await token.transfer(wallet.address, amount, { from: other });
            expect(await token.balanceOf(wallet.address)).to.be.bignumber.equal(amount);
            otherAddressBalance = await token.balanceOf(otherAddress);
            const proposalId = (await wallet.createProposal({ from: creator })).logs[0].args.proposalId.valueOf();
            await wallet.submitTransaction(token.address, 0, token.contract.methods.transfer(otherAddress, amount).encodeABI(), proposalId, new BN('0'), { from: creator });
            await wallet.submitProposal(proposalId, { from: creator });
            await wallet.executeProposal(proposalId, { from: assembly });
            expect(await token.balanceOf(otherAddress)).to.be.bignumber.equal(otherAddressBalance.add(amount));
            expect(await token.balanceOf(wallet.address)).to.be.bignumber.equal('0');
        });
    });
}


async function runMultiTransactionTests() {
    let proposalId;
    let receipt;
    let transactionCountOffset;
    let txIds;

    describe('Multiple-transaction per proposal', async () => {
        it('Multiple-transaction proposal - submission', async () => {
            // proposal scheme:
            // step0: tx0
            // step1: tx1, tx2
            // step2: tx3, tx4, tx5
            // step3: tx6, tx7, tx8, tx9

            await hre.network.provider.request({
                method: "hardhat_setBalance",
                params: [wallet.address, `0x0`],
            });
            const totalAmount = amount.mul(new BN('10')).sub(new BN('1')); // amount = X-1 to force the execution failure of the last step
            transactionCountOffset = await wallet.getTransactionCount();

            await web3.eth.sendTransaction({ to: wallet.address, value: totalAmount, from: creator });
            expect(new BN(await web3.eth.getBalance(wallet.address))).to.be.bignumber.equal(totalAmount);
            proposalId = await createProposal(wallet, creator);
            await checkProposal(proposalId, PROPOSAL_STATUS.Created, 0, []);

            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('0'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('0')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('1'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('1')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('1'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('2')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('2'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('3')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('2'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('4')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('2'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('5')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('3'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('6')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('3'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('7')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('3'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('8')));
            expect(await submitTransaction(wallet, otherAddress, amount, [], proposalId, new BN('3'), creator)).to.be.bignumber.equal(transactionCountOffset.add(new BN('9')));

            txIds = [[transactionCountOffset.add(new BN('0'))],
            [transactionCountOffset.add(new BN('1')), transactionCountOffset.add(new BN('2'))],
            [transactionCountOffset.add(new BN('3')), transactionCountOffset.add(new BN('4')), transactionCountOffset.add(new BN('5'))],
            [transactionCountOffset.add(new BN('6')), transactionCountOffset.add(new BN('7')), transactionCountOffset.add(new BN('8')), transactionCountOffset.add(new BN('9'))]
            ];

            await checkProposal(proposalId, PROPOSAL_STATUS.Created, 0, txIds);

            await checkTransaction(transactionCountOffset.add(new BN('0')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('1')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('2')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('3')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('4')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('5')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('6')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('7')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('8')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('9')), otherAddress, amount, [], false);

            receipt = await wallet.submitProposal(proposalId, { from: creator });
            expectEvent(receipt, 'ProposalSubmitted', { proposalId: proposalId, stepsCount: new BN('4') });
            await checkProposal(proposalId, PROPOSAL_STATUS.Submitted, 0, txIds);
        });

        it('Multiple-transaction proposal - partial execution', async () => {
            receipt = await wallet.executeProposal(proposalId, { from: assembly });
            expectEvent(receipt, 'ProposalPartiallyExecuted', { proposalId: proposalId, stepsCountLeft: new BN('3') });
            await checkProposal(proposalId, PROPOSAL_STATUS.PartiallyExecuted, 1, txIds);
            receipt = await wallet.executeProposal(proposalId, { from: assembly });
            expectEvent(receipt, 'ProposalPartiallyExecuted', { proposalId: proposalId, stepsCountLeft: new BN('2') });
            await checkProposal(proposalId, PROPOSAL_STATUS.PartiallyExecuted, 2, txIds);
            receipt = await wallet.executeProposal(proposalId, { from: assembly });
            expectEvent(receipt, 'ProposalPartiallyExecuted', { proposalId: proposalId, stepsCountLeft: new BN('1') });
            await checkProposal(proposalId, PROPOSAL_STATUS.PartiallyExecuted, 3, txIds);

            await checkTransaction(transactionCountOffset.add(new BN('0')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('1')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('2')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('3')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('4')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('5')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('6')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('7')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('8')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('9')), otherAddress, amount, [], false);

            await checkProposal(proposalId, PROPOSAL_STATUS.PartiallyExecuted, 3, txIds);
        });

        it('Multiple-transaction proposal - execution failed', async () => {
            await expectRevert(
                wallet.executeProposal(proposalId, { from: assembly }),
                REVERT_MESSAGES.proposalStepNotExecuted);

            await checkTransaction(transactionCountOffset.add(new BN('0')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('1')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('2')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('3')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('4')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('5')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('6')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('7')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('8')), otherAddress, amount, [], false);
            await checkTransaction(transactionCountOffset.add(new BN('9')), otherAddress, amount, [], false);

            await checkProposal(proposalId, PROPOSAL_STATUS.PartiallyExecuted, 3, txIds);
        });

        it('Multiple-transaction proposal - execution successful', async () => {
            await web3.eth.sendTransaction({ to: wallet.address, value: new BN('1'), from: other });
            receipt = await wallet.executeProposal(proposalId, { from: assembly });
            expectEvent(receipt, 'ProposalFullyExecuted', { proposalId: proposalId });

            await checkTransaction(transactionCountOffset.add(new BN('0')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('1')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('2')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('3')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('4')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('5')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('6')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('7')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('8')), otherAddress, amount, [], true);
            await checkTransaction(transactionCountOffset.add(new BN('9')), otherAddress, amount, [], true);

            await checkProposal(proposalId, PROPOSAL_STATUS.FullyExecuted, 4, txIds);
        });
    });
}

async function deposit() {
    describe('Funding before upgrade', async () => {
        it('Deposit funds before upgrade', async function () {
            await web3.eth.sendTransaction({ to: wallet.address, value: amount, from: other });
            walletBalance = new BN(await web3.eth.getBalance(wallet.address));
        });
    });
}

async function withdraw() {
    describe('Recovering funds after upgrade', async () => {
        it('Can withdraw the funds after upgrade', async function () {
            expect(new BN(await web3.eth.getBalance(wallet.address))).to.be.bignumber.equal(walletBalance);
            proposalId = (await wallet.createProposal({ from: creator })).logs[0].args.proposalId.valueOf();
            await wallet.submitTransaction(otherAddress, walletBalance, [], proposalId, new BN('0'), { from: creator });
            await wallet.submitProposal(proposalId, { from: creator });
            await wallet.executeProposal(proposalId, { from: assembly });
            expect(new BN(await web3.eth.getBalance(wallet.address))).to.be.bignumber.equal(new BN('0'));
        });
    });
}

contract('Wallet', function (accounts) {
    roles = getAccountRoles(accounts);
    creator = roles.citizen5;
    assembly = roles.assembly;
    other = roles.other;

    it('Deploy', async function () {
        wallet = await deployWalletTestable(artifacts);
        token = await TestToken.new({ from: other });
    });

    it('Operator cannot be 0x0', async function () {
        await expectRevert(wallet.initialize(ZERO_ADDRESS), REVERT_MESSAGES.assemblyCannotZero);
    });

    it('If not initialized, cannot create or submit proposals and transactions', async () => {
        await expectRevert(wallet.createProposal({ from: creator }), REVERT_MESSAGES.notInitializedYet);
        await expectRevert(wallet.submitTransaction(otherAddress, amount, [], 0, 0, { from: creator }), REVERT_MESSAGES.notInitializedYet);
        await expectRevert(wallet.submitProposal(0, { from: creator }), REVERT_MESSAGES.notInitializedYet);
    });

    it('Initialize', async function () {
        await initializeWallet(wallet, assembly);
        await wallet.setTestMode(true); // Set contract in test mode

        expect(await wallet.getAssembly()).to.be.equal(assembly);
    });

    describe('Before upgrade', async function () {
        runGeneralTests();
        runMultiTransactionTests();
        deposit();
    });

    describe('Upgrade', async function () {
        it('Only the contract itself can upgrade', async () => {
            const walletUpgrade = await WalletUpgrade.new({ from: other });
            await expectRevert(wallet.upgradeTo(walletUpgrade.address, { from: assembly }), REVERT_MESSAGES.cannotDoThis);
        });

        it('Can upgrade', async () => {
            const walletUpgrade = await WalletUpgrade.new({ from: other });

            const proposalId = (await wallet.createProposal({ from: creator })).logs[0].args.proposalId.valueOf();
            await wallet.submitTransaction(wallet.address, 0, wallet.contract.methods.upgradeTo(walletUpgrade.address).encodeABI(), proposalId, new BN('0'),
                { from: creator });
            await wallet.submitProposal(proposalId, { from: creator });

            const proposalCountBefore = await wallet.getProposalCount();
            const transactionCountBefore = await wallet.getTransactionCount();

            await wallet.executeProposal(proposalId, { from: assembly });
            wallet = await WalletUpgrade.at(wallet.address);

            // verify that the contract was upgraded
            expect(await wallet.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));

            // sanity check to verify state was preserved after upgrade
            expect(await wallet.getProposalCount()).to.be.bignumber.equal(proposalCountBefore);
            expect(await wallet.getTransactionCount()).to.be.bignumber.equal(transactionCountBefore);
        });

    });

    describe('After upgrade', async function () {
        withdraw();
        runGeneralTests();
        runMultiTransactionTests();
    });
});
