const { BN, time, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
require('@nomiclabs/hardhat-ethers');
const ProofOfHumanityOracle = artifacts.require('ProofOfHumanityOracle');
const Assembly = artifacts.require('Assembly');
const Wallet_old = artifacts.require('upgrades/0/Wallet0');
const Wallet_new = artifacts.require('Wallet');

const {
    getConfig,
} = require('../../scripts/hardhat-tasks');

const {
    getAccountRoles,
    parseTally,
    execTask,
} = require('../../scripts/common');

// On block 31660000, citizenCount = 87, and roles.creator appointment count = 6.
// Therefore, 87 / 2 = 44 appointments needed for a +50% majority
const NUM_NEW_CITIZENS = 40;

async function run(artifacts, accounts) {
    let config, roles;
    let poh, assembly, wallet;
    let state;
    let walletUpgradeAddress;
    let fromAdress;

    describe('Upgrade test on mainnet fork chain', async () => {
        it('Load initial state before upgrade', async () => {
            config = await getConfig();
            roles = getAccountRoles(accounts);

            state = {};
            state['old'] = {};
            state['new'] = {};
            state['new_2'] = {};

            console.log(`Getting current ProofOfHumanityOracle contract from ${config.contractAddresses.poh}`);
            poh = await ProofOfHumanityOracle.at(config.contractAddresses.poh);
            console.log(`Getting current Assembly contract from ${config.contractAddresses.assembly}`);
            assembly = await Assembly.at(config.contractAddresses.assembly);
            console.log(`Getting current Wallet contract from ${config.contractAddresses.wallet}`);
            wallet = await Wallet_old.at(config.contractAddresses.wallet);
        });

        it('Deploy upgraded contract', async () => {
            walletUpgradeAddress = await execTask(`_contracts-implementation-deploy --contract wallet`);
        });

        it('Create democratic majority', async () => {
            fromAdress = await assembly.getCreator();

            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [fromAdress],
            });

            // impersonate and fund the Wallet contract for later
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [config.contractAddresses.wallet],
            });
            await web3.eth.sendTransaction({ to: config.contractAddresses.wallet, value: new BN('1000000000000000000'), from: roles.other });

            // create a mayority of citizens to approve the proposal
            const newCitizens = [];
            for (let i = 0; i < NUM_NEW_CITIZENS; i++) {
                console.log(`New citizen ${i}`);
                newCitizens[i] = config.accounts[i];

                await poh.registerHuman(newCitizens[i], { from: config.contractAddresses.wallet })
                await assembly.applyForCitizenship({ from: newCitizens[i] });
                await assembly.appointDelegate(fromAdress, { from: newCitizens[i] });
            }
            const appointmentCountAfter = await assembly.getAppointmentCount(fromAdress);
            const citizenCount = await assembly.getCitizenCount();
            const creatorVotingPercent = appointmentCountAfter.mul(new BN('100')).div(citizenCount);
            expect(creatorVotingPercent).to.be.bignumber.greaterThan(new BN('50'));
        });

        it('Create tally and upgrade', async () => {
            receipt = await wallet.submitProposal(
                wallet.address,
                0,
                wallet.contract.methods.upgradeTo(walletUpgradeAddress).encodeABI(),
                { from: fromAdress });
            let proposalId = receipt.logs[0].args.proposalId.valueOf();

            receipt = await assembly.createTally(proposalId, { from: fromAdress });
            tallyId = receipt.logs[0].args.tallyId.valueOf();
            await assembly.castDelegateVote(tallyId, true, { from: fromAdress });

            let tally = parseTally(await assembly.getTally(tallyId));
            await time.increaseTo((new BN(tally.votingEndTime)).add(new BN('1')));
            await assembly.tallyUp(tallyId, { from: fromAdress });

            // store state right before upgrade
            state['old']['proposalCount'] = parseInt(await wallet.getProposalCount())
            expect(new BN(state['old']['proposalCount'])).to.be.bignumber.equal(new BN('2'));

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
            await execTask(`_tally-delegate-vote --tallyid ${tallyId} --voter ${fromAdress} --vote 1`);

            let tally = await execTask(`_tally-get --tallyid ${tallyId}`);
            const newTime = tally.votingEndTime[0] + 1;
            await execTask(`_time-increaseto --time ${newTime}`);

            await assembly.tallyUp(tallyId, { from: fromAdress });

            for (let stepNum = 0; stepNum < stepCount; stepNum++)
                await assembly.execute(tallyId, { from: roles.other });

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

contract('upgrade0_mainnet_fork', function (accounts) {
    run(artifacts, accounts);
});
