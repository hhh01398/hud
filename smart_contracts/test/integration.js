const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
require('@nomiclabs/hardhat-ethers');
const AssemblyUpgrade = artifacts.require('AssemblyUpgrade');

const {
    getConfig,
    parseBalance,
} = require('../scripts/hardhat-tasks');

const {
    SOME_UINT,
    execTask,
    GAS_LIMIT,
} = require('../scripts/common');

const NUM_ADDRESSES_PER_TRANSACTION = 200;
const AMOUNT = new BN('100');
const ADDRESSES = ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'];
const RECEIVER = ADDRESSES[0];
const ADDRESSES_FILE_PATH = 'test/test_artifacts/addresses_sample.txt';


async function runTallyProcess(proposalId, { stepCount = 1 } = {}) {
    const tallyId = parseInt(await execTask(`_tally-create --proposalid ${proposalId}`));
    await execTask(`_tally-delegate-vote --tallyid ${tallyId} --voter 0 --vote 1`);
    await execTask(`_tally-delegate-vote --tallyid ${tallyId} --voter 1 --vote 1`);
    let tally = await execTask(`_tally-get --tallyid ${tallyId}`);
    const newTime = tally.votingEndTime[0] + 100;
    await execTask(`_time-increaseto --time ${newTime}`);
    await execTask(`_tally-tallyUp --tallyid ${tallyId} --from 0`);
    tally = await execTask(`_tally-get --tallyid ${tallyId}`);
    for (let stepNum = 0; stepNum < stepCount; stepNum++)
        await execTask(`_tally-execute --tallyid ${tallyId} --from 2 --gaslimit ${GAS_LIMIT}`);
    tally = await execTask(`_tally-get --tallyid ${tallyId}`);
    expect(tally.status).to.be.equal('Enacted');
}

async function run(artifacts, accounts) {
    let config;
    let daoinfo;

    describe('Run scenarios through tasks', async () => {
        it('Deploy', async () => {
            await execTask(`_contracts-deploy --testable true`);
        });

        it('Register human addresses in PoH oracle', async () => {
            await execTask(`_humanity-set-bulk --inputfile ${ADDRESSES_FILE_PATH} --numaddressespertransaction ${NUM_ADDRESSES_PER_TRANSACTION}`);
        });

        it('Initialize', async () => {
            await execTask(`_contracts-initialize`);
            config = await getConfig();
            daoinfo = await execTask(`_get-dao-info`);
        });

        it('Populate', async () => {
            for (let i = 0; i < 6; i++) {
                await execTask(`_humanity-set --address ${i}`);
            }
            for (let i = 0; i < 3; i++) {
                await execTask(`_delegate-apply --from ${i}`);
            }
            for (let i = 0; i < 6; i++) {
                await execTask(`_citizen-apply --from ${i}`);
            }
            await execTask(`_delegate-appoint --delegate 0 --from 0`);
            await execTask(`_delegate-appoint --delegate 0 --from 1`);
            await execTask(`_delegate-appoint --delegate 1 --from 2`);
            await execTask(`_delegate-appoint --delegate 1 --from 3`);
        });


        it('Seat', async () => {
            await execTask(`_delegate-claimseat --seatnum 0 --from 0`);
            await execTask(`_delegate-claimseat --seatnum 1 --from 1`);
            await execTask(`_token-distributeDelegationReward`);
        });

        it('Proposal #1: Send coins', async () => {
            const balanceBefore = new BN(await web3.eth.getBalance(RECEIVER));
            await web3.eth.sendTransaction({ to: config.contractAddresses.wallet, value: AMOUNT, from: config.roles.other });
            const proposalId = await execTask(`_proposal-create`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 0 --recipient ${RECEIVER} --value ${AMOUNT}`);
            await execTask(`_proposal-submit --proposalid ${proposalId}`);
            await runTallyProcess(proposalId);
            expect(await web3.eth.getBalance(RECEIVER)).to.be.bignumber.equal(balanceBefore.add(AMOUNT));
        });

        it('Proposal #2: Send tokens', async () => {
            let addressInfo = await execTask(`_get-address-info --address ${RECEIVER}`);
            const balanceBefore = parseBalance(addressInfo.tokenBalance[0]);
            const data = await execTask(`_transaction-encode-sendtoken --recipient ${RECEIVER} --value ${AMOUNT}`);
            const proposalId = await execTask(`_proposal-create`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 0 --recipient token --value 0 --data ${data}`);
            await execTask(`_proposal-submit --proposalid ${proposalId}`);
            await runTallyProcess(proposalId);
            addressInfo = await execTask(`_get-address-info --address ${RECEIVER}`);
            expect(parseBalance(addressInfo.tokenBalance[0])).to.be.bignumber.equal(balanceBefore.add(AMOUNT));
        });

        it('Proposal #3: Upgrade', async () => {
            const assemblyUpgrade = await AssemblyUpgrade.new();
            const data = await execTask(`_transaction-encode-upgrade --contract assembly --newimplementationaddress ${assemblyUpgrade.address}`);
            const proposalId = await execTask(`_proposal-create`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 0 --recipient assembly --value 0 --data ${data}`);
            await execTask(`_proposal-submit --proposalid ${proposalId}`);
            await runTallyProcess(proposalId);
            assembly = await AssemblyUpgrade.at(config.contractAddresses.assembly);
            expect(await assembly.additionalFunction(new BN(SOME_UINT))).to.be.bignumber.equal(new BN(SOME_UINT));
        });

        it('Proposal #4: Multiple transactions', async () => {
            const balanceBefore = new BN(await web3.eth.getBalance(RECEIVER));
            await web3.eth.sendTransaction({ to: config.contractAddresses.wallet, value: AMOUNT, from: config.roles.other });
            const proposalId = await execTask(`_proposal-create`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 0 --recipient ${RECEIVER} --value 1`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 1 --recipient ${RECEIVER} --value 2`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 1 --recipient ${RECEIVER} --value 2`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 2 --recipient ${RECEIVER} --value 3`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 2 --recipient ${RECEIVER} --value 3`);
            await execTask(`_transaction-submit --proposalid ${proposalId} --stepnum 2 --recipient ${RECEIVER} --value ${AMOUNT.sub(new BN('11'))}`);
            await execTask(`_proposal-submit --proposalid ${proposalId}`);
            await runTallyProcess(proposalId, { stepCount: 3 });
            expect(await web3.eth.getBalance(RECEIVER)).to.be.bignumber.equal(balanceBefore.add(AMOUNT));
        });


        it('Encoding other proposals', async () => {
            await execTask(`_transaction-encode-distrust --address ${ADDRESSES[1]}`);
            await execTask(`_transaction-encode-expel --address ${ADDRESSES[1]}`);
            await execTask(`_transaction-encode-registerHumans --addresses ${ADDRESSES[0]},${ADDRESSES[1]}`);
            await execTask(`_transaction-encode-deregisterHumans --addresses ${ADDRESSES[0]},${ADDRESSES[1]}`);
            await execTask(`_transaction-encode-setExecRewardExponentMax --value 0`);
            await execTask(`_transaction-encode-setReferralRewardParams --referredamount 0 --referreramount 0`);
        });

        it('Collect delegation and execution reward tokens', async () => {
            await execTask(`_token-distributeDelegationReward`);

            let addressInfo = await execTask(`_get-address-info --address 0`);
            const rewardBalanceBefore = parseBalance(addressInfo.rewardBalance[0]);
            const tokenBalanceBefore = parseBalance(addressInfo.tokenBalance[0]);

            await execTask(`_token-claimRewards --address 0`);
            addressInfo = await execTask(`_get-address-info --address 0`);
            const rewardBalanceAfter = parseBalance(addressInfo.rewardBalance[0]);
            const tokenBalanceAfter = parseBalance(addressInfo.tokenBalance[0]);

            expect(rewardBalanceAfter).to.be.bignumber.equal(new BN('0'));
            expect(tokenBalanceAfter).to.be.bignumber.equal(rewardBalanceBefore.add(tokenBalanceBefore));
        });

        it('Collect referral reward tokens', async () => {
            const referrerAmount = parseBalance(daoinfo.assembly.referrerAmount[0]);
            const referredAmount = parseBalance(daoinfo.assembly.referredAmount[0]);

            let addressInfo = await execTask(`_get-address-info --address 0`);
            const referrerBalanceBefore = parseBalance(addressInfo.tokenBalance[0]);
            addressInfo = await execTask(`_get-address-info --address 1`);
            const referredBalanceBefore = parseBalance(addressInfo.tokenBalance[0]);

            await execTask(`_token-claimReferralReward --referrer 0 --from 1`);

            addressInfo = await execTask(`_get-address-info --address 0`);
            expect(parseBalance(addressInfo.tokenBalance[0])).to.be.bignumber.equal(referrerBalanceBefore.add(referrerAmount));
            addressInfo = await execTask(`_get-address-info --address 1`);
            expect(parseBalance(addressInfo.tokenBalance[0])).to.be.bignumber.equal(referredBalanceBefore.add(referredAmount));
        });
    });
}

contract('Integration', function (accounts) {
    run(artifacts, accounts);
});
