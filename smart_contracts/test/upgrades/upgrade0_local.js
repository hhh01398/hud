const { BN, time, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
require('@nomiclabs/hardhat-ethers');
const Wallet_old = artifacts.require('upgrades/0/Wallet0');
const Wallet_new = artifacts.require('Wallet');
const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');

const {
    setConfig,
} = require('../../scripts/hardhat-tasks');

const {
    getAccountRoles,
    deployAll,
    initializeAll,
    buildSeatScenario,
    parseTally,
    execTask,
    GAS_LIMIT,
} = require('../../scripts/common');

async function run(artifacts, accounts) {
    let roles;
    let poh, assembly, wallet, token, faucet;
    let state;
    let walletUpgradeAddress;

    describe('Upgrade test on local chain', async () => {

        it('Create initial state before upgrade', async () => {
            roles = getAccountRoles(accounts);

            state = {};
            state['old'] = {};
            state['new'] = {};
            state['new_2'] = {};

            [poh, assembly, _, token, faucet] = await deployAll(artifacts, { testable: true });
            wallet = await Wallet_old.at((await ERC1967Proxy.new((await Wallet_old.new()).address, '0x')).address);
            setConfig(poh, assembly, wallet, token, faucet);

            await initializeAll(poh, assembly, wallet, token, faucet, roles);
            await poh.setTestMode(true);
            await buildSeatScenario(roles, poh, assembly);
            await assembly.setTestMode(true);
        });

        it('Deploy upgraded contract', async () => {
            walletUpgradeAddress = await execTask(`_contracts-implementation-deploy --contract wallet`);
        });

        it('Create tally and upgrade', async () => {
            const fromAdress = roles.delegate1;

            receipt = await wallet.submitProposal(
                wallet.address,
                0,
                wallet.contract.methods.upgradeTo(walletUpgradeAddress).encodeABI(),
                { from: fromAdress });
            const proposalId = receipt.logs[0].args.proposalId.valueOf();

            receipt = await assembly.createTally(proposalId, { from: fromAdress });
            const tallyId = receipt.logs[0].args.tallyId.valueOf();

            await assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 });
            await assembly.castDelegateVote(tallyId, true, { from: roles.delegate2 });
            await assembly.castDelegateVote(tallyId, true, { from: roles.delegate3 });

            let tally = parseTally(await assembly.getTally(tallyId));
            await time.increaseTo((new BN(tally.votingEndTime)).add(new BN('1')));
            await assembly.tallyUp(tallyId, { from: fromAdress });

            // store state right before upgrade
            state['old']['proposalCount'] = parseInt(await wallet.getProposalCount())
            expect(new BN(state['old']['proposalCount'])).to.be.bignumber.equal(new BN('1'));

            await assembly.enact(tallyId, { from: roles.other });

            tally = await execTask(`_tally-get --tallyid ${tallyId}`);
            expect(tally.status).to.be.equal('Enacted');

            wallet = await Wallet_new.at(wallet.address);
        });

        it('Check state is preserved', async () => {
            state['new']['_get-dao-info'] = await execTask(`_get-dao-info`);
            expect(new BN(state['new']['_get-dao-info']['wallet']['proposalCount'])).to.be.bignumber.equal(new BN('0'));
            expect(new BN(state['new']['_get-dao-info']['wallet']['transactionCount'])).to.be.bignumber.equal(new BN(state['old']['proposalCount']));
        });

        it('Test new features', async () => {
            const AMOUNT = new BN('100');
            const RECEIVER = '0x0000000000000000000000000000000000000001';

            const balanceBefore = new BN(await web3.eth.getBalance(RECEIVER));
            await web3.eth.sendTransaction({ to: wallet.address, value: AMOUNT, from: roles.other });

            const proposalId = await execTask(`_proposal-create`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 0 --recipient ${RECEIVER} --value 1`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 1 --recipient ${RECEIVER} --value 1`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 1 --recipient ${RECEIVER} --value 1`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 2 --recipient ${RECEIVER} --value 1`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 2 --recipient ${RECEIVER} --value 1`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 2 --recipient ${RECEIVER} --value ${AMOUNT.sub(new BN('5'))}`);
            await execTask(`_proposal-submit --proposalid ${proposalId}`);
            const stepCount = 3
            const tallyId = parseInt(await execTask(`_tally-create --proposalid ${proposalId}`));
            await execTask(`_tally-delegate-vote --tallyid ${tallyId} --voter ${roles.delegate1} --vote 1`);
            await execTask(`_tally-delegate-vote --tallyid ${tallyId} --voter ${roles.delegate2} --vote 1`);
            await execTask(`_tally-delegate-vote --tallyid ${tallyId} --voter ${roles.delegate3} --vote 1`);
            let tally = await execTask(`_tally-get --tallyid ${tallyId}`);
            const newTime = tally.votingEndTime[0] + 1;
            await execTask(`_time-increaseto --time ${newTime}`);
            await execTask(`_tally-tallyUp --tallyid ${tallyId}`);
            tally = await execTask(`_tally-get --tallyid ${tallyId}`);
            for (let stepNum = 0; stepNum < stepCount; stepNum++)
                await execTask(`_tally-execute --tallyid ${tallyId} --gaslimit ${GAS_LIMIT}`);

            tally = await execTask(`_tally-get --tallyid ${tallyId}`);
            expect(tally.status).to.be.equal('Enacted');
            expect(await web3.eth.getBalance(RECEIVER)).to.be.bignumber.equal(balanceBefore.add(AMOUNT));
        });

        it('Check state is continued', async () => {
            state['new_2']['_get-dao-info'] = await execTask(`_get-dao-info`);
            expect(new BN(state['new_2']['_get-dao-info']['wallet']['proposalCount'])).to.be.bignumber.equal(new BN('1'));
            expect(new BN(state['new_2']['_get-dao-info']['wallet']['transactionCount'])).to.be.bignumber.equal((new BN(state['old']['proposalCount'])).add(new BN('6')));
        });
    });
}

contract('upgrade0_local', function (accounts) {
    run(artifacts, accounts);
});
