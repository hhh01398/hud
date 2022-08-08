const { BN, time } = require('@openzeppelin/test-helpers');
const { exec } = require('child_process');
const { expect } = require('chai');
const deploymentParams = require('../deployment-params');

///////////////////////////////////////////////////////////////
// constants 
///////////////////////////////////////////////////////////////

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SOME_UINT = '1234567890';
const DEFAULT_THRESHOLD = new BN('50');
const REVERT_MESSAGES = {
    cannotDoThis: 'You are not allowed to do this',
    notInitializedYet: 'Contract has not yet been initialized',
    pohCannotZero: 'PoH contract address cannot be zero',
    assemblyCannotZero: 'Assembly contract address cannot be zero',
    walletCannotZero: 'Wallet contract address cannot be zero',
    tokenCannotZero: 'Token contract address cannot be zero',
    ownerCannotZero: 'Owner address cannot be zero',
    upgraderCannotZero: 'Upgrader address cannot be zero',
    updaterCannotZero: 'Updater address cannot be zero',
    creatorCannotZero: 'Creator address cannot be zero',
    alreadyInitialized: 'Contract has already been initialized',
    notHuman: 'You are not a human',
    youAreNotCitizen: 'You are not a citizen',
    youAreNotDelegate: 'You are not a delegate',
    delegateAlready: 'You are a delegate already',
    notBelongToDelegate: 'The address does not belong to a delegate',
    alreadyAppointedDelegate: 'You already appointed this delegate',
    invalidSeatCount: 'Invalid number of seats',
    invalidValue: 'Invalid parameter value',
    alreadySeated: 'You are already seated',
    wrongSeat: 'Wrong seat number',
    cannotDecreaseSeats: 'Decreasing the number of seats is not supported',
    voteAlready: 'That is your current vote already',
    proposalNotApprovedOrEnacted: 'The proposal was not approved or was already enacted',
    delegatesNoVoteRevokation: 'Delegates cannot vote during the revocation phase',
    cannotEndQuorum: 'Tally cannot be ended as quorum is not reached',
    votingEnded: 'The voting has ended',
    notUpgrader: 'You are not the upgrader',
    notUpdater: 'You are not the updater',
    initializableAlready: 'Initializable: contract is already initialized',
    totalSupplyCannotZero: 'Total supply cannot be zero',
    reserveAddressCannotZero: 'Reserve address cannot be zero',
    faucetAddressCannotZero: 'Faucet address cannot be zero',
    faucetBalanceCannotZero: 'Faucet initial balance cannot be zero',
    onlyGovernor: 'Only the governor can perform this operation',
    onlyAssembly: 'Only the Assembly can perform this operation',
    addressBlocked: 'Address is blocked',
    addressNotBlocked: 'Address is not blocked',
    senderAddressBlocked: 'The sender address is blocked',
    recipientAddressBlocked: 'The recipient address is blocked',
    stillHuman: 'Challenged is still a human',
    cannotExpel: 'Cannot be expelled',
    neitherCitizenNorDelegate: 'You are neither a citizen nor a delegate',
    referThemselves: 'Referrers cannot refer themselves',
    referredMust: 'To be referred, first you must become a citizen or a delegate',
    referrerMust: 'Your referrer must be a citizen or a delegate',
    wrongTally: 'Wrong tally id',
    expRewardMaxMin: 'Max reward must be greater than or equal to min reward',
    newParameterValueMustDiff: 'The new parameter value must be different',
    newAddressMustDiff: 'The new address must be different',
    wrongProposalId: 'Wrong proposal id',
    notTrusted: 'You are not trusted to perform this operation',
    noRewardToClaim: 'Your reward balance is zero',
    wrongProposalStatus: 'Wrong proposal status',
    proposalOnlyCreator: 'Only the proposal creator can perform this operation',
    proposalCannotChange: 'Proposal was already submitted and cannot be changed',
    proposalFullyExecuted: 'Proposal was already fully executed',
    proposalStepNotExecuted: 'Proposal step could not be executed',
    needToFillEmptyStepsFirst: 'You need to submit at least one transaction into any prior empty steps first',
    emptyProposal: 'No transactions were submitted for this proposal',
}
const TASK_COMMAND_PREFIX = 'yarn --silent task';
const GAS_LIMIT = 10000000;

///////////////////////////////////////////////////////////////
// common functions 
///////////////////////////////////////////////////////////////

function getAccountRoles(accounts) {
    return {
        creator: accounts[0],
        delegate1: accounts[1],
        delegate2: accounts[2],
        delegate3: accounts[3],
        citizen1: accounts[4],
        citizen2: accounts[5],
        citizen3: accounts[6],
        citizen4: accounts[7],
        citizen5: accounts[8],
        owner: accounts[9],
        upgrader: accounts[10],
        other: accounts[11],
        governor: accounts[12],
        operator: accounts[13],
        assembly: accounts[14],
        wallet: accounts[15],
        token: accounts[16],
        faucet: accounts[17],
        human: accounts[18],
    };
}

function getGasPrice() {
    return process.env.GAS_PRICE;
}

async function deployImplementationContractPohOracle(artifacts) {
    const ProofOfHumanityOracle = artifacts.require('ProofOfHumanityOracle');
    return await ProofOfHumanityOracle.new({gasPrice: getGasPrice()});
}

async function deployImplementationContractPohOracleTestable(artifacts) {
    const ProofOfHumanityOracleTestable = artifacts.require('ProofOfHumanityOracleTestable');
    return await ProofOfHumanityOracleTestable.new({gasPrice: getGasPrice()});
}

async function deployPohOracle(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const ProofOfHumanityOracle = artifacts.require('ProofOfHumanityOracle');

    return await ProofOfHumanityOracle.at((await ERC1967Proxy.new((await deployImplementationContractPohOracle(artifacts)).address, '0x')).address);
}

async function deployPohOracleTestable(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const ProofOfHumanityOracle = artifacts.require('ProofOfHumanityOracle');

    return await ProofOfHumanityOracle.at((await ERC1967Proxy.new((await deployImplementationContractPohOracleTestable(artifacts)).address, '0x')).address);
}

async function deployImplementationContractAssembly(artifacts) {
    const Assembly = artifacts.require('Assembly');
    return await Assembly.new({gasPrice: getGasPrice()});
}

async function deployImplementationContractAssemblyTestable(artifacts) {
    const AssemblyTestable = artifacts.require('AssemblyTestable');
    return await AssemblyTestable.new({gasPrice: getGasPrice()});
}

async function deployAssembly(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const Assembly = artifacts.require('Assembly');

    return await Assembly.at((await ERC1967Proxy.new((await deployImplementationContractAssembly(artifacts)).address, '0x')).address);
}

async function deployAssemblyTestable(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const Assembly = artifacts.require('Assembly');

    return await Assembly.at((await ERC1967Proxy.new((await deployImplementationContractAssemblyTestable(artifacts)).address, '0x')).address);
}

async function deployImplementationContractWallet(artifacts) {
    const Wallet = artifacts.require('Wallet');
    return await Wallet.new({gasPrice: getGasPrice()});
}

async function deployImplementationContractWalletTestable(artifacts) {
    const WalletTestable = artifacts.require('WalletTestable');
    return await WalletTestable.new({gasPrice: getGasPrice()});
}

async function deployWallet(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const Wallet = artifacts.require('Wallet');

    return await Wallet.at((await ERC1967Proxy.new((await deployImplementationContractWallet(artifacts)).address, '0x')).address);
}

async function deployWalletTestable(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const Wallet = artifacts.require('Wallet');

    return await Wallet.at((await ERC1967Proxy.new((await deployImplementationContractWalletTestable(artifacts)).address, '0x')).address);
}

async function deployImplementationContractToken(artifacts) {
    const Token = artifacts.require('Token');
    return await Token.new({gasPrice: getGasPrice()});
}

async function deployToken(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const Token = artifacts.require('Token');

    return await Token.at((await ERC1967Proxy.new((await deployImplementationContractToken(artifacts)).address, '0x')).address);
}

async function deployImplementationContractFaucet(artifacts) {
    const Faucet = artifacts.require('Faucet');
    return await Faucet.new({gasPrice: getGasPrice()});
}

async function deployFaucet(artifacts) {
    const ERC1967Proxy = artifacts.require('@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy');
    const Faucet = artifacts.require('Faucet');

    return await Faucet.at((await ERC1967Proxy.new((await deployImplementationContractFaucet(artifacts)).address, '0x')).address);
}

async function deployAll(artifacts, { testable = false } = {}) {
    poh = testable ? await deployPohOracleTestable(artifacts) : await deployPohOracle(artifacts);
    assembly = testable ? await deployAssemblyTestable(artifacts) : await deployAssembly(artifacts);
    wallet = testable ? await deployWalletTestable(artifacts) : await deployWallet(artifacts);
    token = await deployToken(artifacts);
    faucet = await deployFaucet(artifacts);

    return [poh, assembly, wallet, token, faucet];
}

async function pohRegisterBulk(poh, addresses, chunkSize, updater, { deregister = false } = {}) {
    const chunks = chunk(addresses, chunkSize);
    let ret = {}
    for (let i = 0; i < chunks.length; i++) {
        ret[i] = [`Processing chunk [${i + 1}/${chunks.length}]...`, chunks[i]];
        if (deregister)
            await poh.deregisterHumans(chunks[i], { from: updater });
        else
            await poh.registerHumans(chunks[i], { from: updater });
    }
    return ret;
}

async function initializePohOracle(poh, updaterAddress, upgraderAddress) {
    await poh.initialize(updaterAddress, upgraderAddress);
}

async function initializeAssembly(assembly, pohAddress, ownerAddress, walletAddress, faucetAddress, roles) {
    await assembly.initialize(
        pohAddress,
        ownerAddress,
        walletAddress,
        deploymentParams.SEAT_COUNT,
        deploymentParams.CITIZEN_COUNT_QUORUM,
        deploymentParams.TALLY_DURATION,
        faucetAddress,
        deploymentParams.DELEGATION_REWARD_RATE,
        deploymentParams.REFERRAL_REWARD,
        deploymentParams.EXEC_REWARD_EXPONENT_MAX,
        { from: roles.creator }
    );
}

async function initializeWallet(wallet, operatorAddress) {
    await wallet.initialize(operatorAddress);
}

async function initializeToken(token, tokenName, tokenSymbol, defaultOperators, totalSupply, reserveAddress, governorAddress, upgraderAddress, faucetAddress, faucetInitialBalance) {
    await token.initialize(tokenName, tokenSymbol, defaultOperators, totalSupply, reserveAddress, governorAddress, upgraderAddress, faucetAddress, faucetInitialBalance);
}

async function initializeFaucet(faucet, assemblyAddress, walletAddress, tokenAddress, upgraderAddress) {
    await faucet.initialize(
        assemblyAddress,
        walletAddress,
        tokenAddress,
        upgraderAddress,
    );
}

async function initializeAll(poh, assembly, wallet, token, faucet, roles) {
    await initializePohOracle(poh, wallet.address, wallet.address);
    await initializeAssembly(assembly, poh.address, wallet.address, wallet.address, faucet.address, roles);
    await initializeWallet(wallet, assembly.address);
    await initializeToken(
        token,
        deploymentParams.TOKEN_NAME,
        deploymentParams.TOKEN_SYMBOL,
        [],
        deploymentParams.TOKEN_SUPPLY,
        wallet.address,
        wallet.address,
        wallet.address,
        faucet.address,
        deploymentParams.FAUCET_INITIAL_BALANCE,
    );
    await initializeFaucet(faucet, assembly.address, wallet.address, token.address, wallet.address);
}

///////////////////////////////////////////////////////////////
// functions relying on assembly-wallet integration
///////////////////////////////////////////////////////////////

async function createProposal(wallet, fromAddress) {
    const receipt = await wallet.createProposal({ from: fromAddress });
    return receipt.logs[0].args.proposalId.valueOf();
}

async function submitTransaction(wallet, destination, value, data, proposalId, stepNum, fromAddress) {
    return (await wallet.submitTransaction(destination, value, data, proposalId, stepNum, { from: fromAddress })).logs[0].args.transactionId.valueOf();
}

async function createTally(assembly, proposalId, roles) {
    receipt = await assembly.createTally(proposalId, { from: roles.delegate1 });
    tallyId = receipt.logs[0].args.tallyId.valueOf()
    return tallyId;
}

async function createAndApprove(assembly, roles, proposalId) {
    tallyId = await createTally(assembly, proposalId, roles);
    await assembly.castDelegateVote(tallyId, true, { from: roles.delegate1 });
    await assembly.castDelegateVote(tallyId, true, { from: roles.delegate2 });
    await assembly.tallyUp(tallyId);
    tally = parseTally(await assembly.getTally(tallyId));
    await time.increaseTo((new BN(tally.votingEndTime)).add(new BN('1')));
    return await assembly.execute(tallyId, { from: roles.executor });
}

async function buildPopulationScenario(roles, poh, assembly) {
    await poh.registerHuman(roles.citizen1, { from: roles.updater });
    await poh.registerHuman(roles.citizen2, { from: roles.updater });
    await poh.registerHuman(roles.citizen3, { from: roles.updater });
    await poh.registerHuman(roles.citizen4, { from: roles.updater });
    await poh.registerHuman(roles.citizen5, { from: roles.updater });
    await poh.registerHuman(roles.delegate1, { from: roles.updater });
    await poh.registerHuman(roles.delegate2, { from: roles.updater });
    await poh.registerHuman(roles.delegate3, { from: roles.updater })

    await assembly.applyForCitizenship({ from: roles.citizen1 });
    await assembly.applyForCitizenship({ from: roles.citizen2 });
    await assembly.applyForCitizenship({ from: roles.citizen3 });
    await assembly.applyForCitizenship({ from: roles.citizen4 });
    await assembly.applyForCitizenship({ from: roles.citizen5 });

    await assembly.applyForDelegation({ from: roles.delegate1 });
    await assembly.applyForDelegation({ from: roles.delegate2 });
    await assembly.applyForDelegation({ from: roles.delegate3 });

    await assembly.appointDelegate(roles.delegate1, { from: roles.citizen1 });
    await assembly.appointDelegate(roles.delegate2, { from: roles.citizen2 });
    await assembly.appointDelegate(roles.delegate3, { from: roles.citizen3 });
    await assembly.appointDelegate(roles.delegate1, { from: roles.citizen4 });

    // Population Distribution
    // -----------------------
    // delegate1: citizen1, citizen4
    // delegate2: citizen2
    // delegate3: citizen3
    // no delegate: citizen5
}

async function buildSeatScenario(roles, poh, assembly) {
    await buildPopulationScenario(roles, poh, assembly);

    await assembly.claimSeat(0, { from: roles.delegate1 });
    await assembly.claimSeat(1, { from: roles.delegate2 });

    // Population Distribution
    // -----------------------
    // seat0  : delegate1: citizen1, citizen4
    // seat1  : delegate2: citizen2
    // no seat: delegate3: citizen3
    // no delegate: citizen5
}

async function validateTallyState(roles, assembly, tallyId, scenario, doTallyUp = true) {
    async function check(status, delegatedYays, citizenNays, citizenYays, phase) {
        const tally = parseTally(await assembly.getTally(tallyId));
        const tallyPhase = parseInt(await assembly.getTallyPhase(tallyId));
        expect(tally.status).to.be.equal(status);
        expect(tally.delegatedYays).to.be.bignumber.equal(new BN(delegatedYays));
        expect(tally.citizenYays).to.be.bignumber.equal(new BN(citizenYays));
        expect(tally.citizenNays).to.be.bignumber.equal(new BN(citizenNays));
        expect(tallyPhase).to.be.equal(phase);
    }
    if (doTallyUp) await assembly.tallyUp(tallyId, { from: roles.other });
    if (scenario == 'initial') {
        await check(TALLY_STATUS.ProvisionalNotApproved, 0, 0, 0, TALLY_PHASE.Deliberation);
    } else if (scenario == 'delegate1yay') {
        await check(TALLY_STATUS.ProvisionalNotApproved, 2, 0, 0, TALLY_PHASE.Deliberation);
    } else if (scenario == 'delegates12yays') {
        await check(TALLY_STATUS.ProvisionalApproved, 3, 0, 0, TALLY_PHASE.Deliberation);
    } else if (scenario == 'delegates12yays_revocation') {
        await check(TALLY_STATUS.ProvisionalApproved, 3, 0, 0, TALLY_PHASE.Revocation);
    } else if (scenario == 'delegates12yaysCitizen1nay') {
        await check(TALLY_STATUS.ProvisionalApproved, 3, 1, 0, TALLY_PHASE.Revocation);
    } else if (scenario == 'delegates12yaysCitizen1nay_ended') {
        await check(TALLY_STATUS.Approved, 3, 1, 0, TALLY_PHASE.Ended);
    } else if (scenario == 'delegates12yaysCitizens145nays') {
        await check(TALLY_STATUS.ProvisionalNotApproved, 3, 3, 0, TALLY_PHASE.Revocation);
    } else if (scenario == 'delegates12yaysCitizens145nays_ended') {
        await check(TALLY_STATUS.NotApproved, 3, 3, 0, TALLY_PHASE.Ended);
    } else if (scenario == 'novotes_revocation') {
        await check(TALLY_STATUS.ProvisionalNotApproved, 0, 0, 0, TALLY_PHASE.Revocation);
    } else if (scenario == 'citizens145yays') {
        await check(TALLY_STATUS.ProvisionalApproved, 0, 0, 3, TALLY_PHASE.Revocation);
    } else if (scenario == 'citizens145yays_ended') {
        await check(TALLY_STATUS.Approved, 0, 0, 3, TALLY_PHASE.Ended);
    } else {
        throw 'Wrong scenario';
    }
}

function checkDelegateRewardsImpl(
    timestampBefore,
    timestampAfter,
    fundBalanceBefore,
    fundBalanceAfter,
    delegateBalancesBefore,
    delegateBalancesAfter,
    rewardRate,
    delegatedHumansDistribution,
    totalDelegatedHumans,
) {
    totalReward = (new BN(timestampAfter).sub(new BN(timestampBefore))).mul(rewardRate);
    talliableDelegatesRewards = delegatedHumansDistribution[1].map(
        function (x) { return new BN(x).mul(totalReward).div(new BN(totalDelegatedHumans)) });
    delegateBalancesAfterCalc = delegateBalancesBefore.map(function (a, idx) {
        return a.add(talliableDelegatesRewards[idx]);
    });
    fundBalanceAfterCalc = fundBalanceBefore.sub(totalReward);

    expect(fundBalanceAfter.sub(fundBalanceAfterCalc).abs()).to.be.bignumber.lessThan('2'); // neglect any rounding errors
    expect(`${delegateBalancesAfterCalc}`).to.be.equal(`${delegateBalancesAfter}`.replace(',0', ''));
}

async function checkDelegateRewards(
    assembly, token, faucet,
    timestampBefore, faucetBalanceBefore, delegateBalancesBefore, delegateSeatAppointmentCounts, appointmentsTotalCount) {

    const timestampAfter = await assembly.getLastSnapshotTimestamp();
    const faucetBalanceAfter = await token.balanceOf(faucet.address);
    const delegateBalancesAfter = await Promise.all((await assembly.getDelegateSeats()).map(async function (delegate) { return await token.balanceOf(delegate) }));
    const delegateSeatAppointmentCounts2 = await assembly.getDelegateSeatAppointmentCounts();
    const appointmentsTotalCount2 = await assembly.getCitizenCount();

    const delegationRewadRate = await assembly.getDelegationRewardRate();

    checkDelegateRewardsImpl(
        timestampBefore,
        timestampAfter,
        faucetBalanceBefore,
        faucetBalanceAfter,
        delegateBalancesBefore,
        delegateBalancesAfter,
        delegationRewadRate,
        delegateSeatAppointmentCounts,
        appointmentsTotalCount);

    return [timestampAfter, faucetBalanceAfter, delegateBalancesAfter, delegateSeatAppointmentCounts2, appointmentsTotalCount2];
}

async function distributeDelegationReward(
    assembly, token, faucet,
    timestampBefore, faucetBalanceBefore, delegateBalancesBefore, delegateSeatAppointmentCountsBefore, appointmentsTotalCountBefore
) {
    await assembly.distributeDelegationReward();

    await Promise.all((await assembly.getDelegateSeats()).map(async function (delegate) {
        const rewardBalance = await assembly.getRewardBalance(delegate);
        if (!(rewardBalance.eq(new BN('0')))) {
            const balanceBefore = await token.balanceOf(delegate);
            await assembly.claimRewards({ from: delegate });
            expect(await assembly.getRewardBalance(delegate)).to.be.bignumber.equal('0');
            expect(await token.balanceOf(delegate)).to.be.bignumber.equal(balanceBefore.add(rewardBalance));
        }
    }));

    return await checkDelegateRewards(
        assembly, token, faucet,
        timestampBefore, faucetBalanceBefore, delegateBalancesBefore, delegateSeatAppointmentCountsBefore, appointmentsTotalCountBefore);
}

///////////////////////////////////////////////////////////////
// Utils
///////////////////////////////////////////////////////////////

function makeMap(twoArrays) {
    const keys = twoArrays[0];
    const values = twoArrays[1];
    let result = {};
    keys.forEach((key, i) => result[key] = values[i]);
    return result;
}

function parseTally(data) {
    return {
        proposalId: new BN(data[0]),
        submissionTime: parseInt(data[1]),
        revocationStartTime: parseInt(data[2]),
        votingEndTime: parseInt(data[3]),
        delegatedYays: new BN(data[4]),
        citizenYays: new BN(data[5]),
        citizenNays: new BN(data[6]),
        citizenCount: new BN(data[7]),
        status: parseInt(data[8]),
    }
}

function formatTally(data) {
    const tally = parseTally(data);
    tally['proposalId'] = web3.utils.hexToNumberString(tally['proposalId']);
    tally['delegatedYays'] = web3.utils.hexToNumberString(tally['delegatedYays']);
    tally['citizenYays'] = web3.utils.hexToNumberString(tally['citizenYays']);
    tally['citizenNays'] = web3.utils.hexToNumberString(tally['citizenNays']);
    tally['citizenCount'] = web3.utils.hexToNumberString(tally['citizenCount']);
    return tally;
}

function createRandomAddress() {
    return '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function chunk(items, size) {
    const chunks = [];
    var j = 0;
    var chunk = [];
    for (var i = 0; i < items.length; i++) {
        if (j < size) {
            chunk.push(items[i]);
            j++;
        } else {
            chunks.push([...chunk]);
            chunk = []
            chunk.push(items[i]);
            j = 1;
        }
    }
    chunks.push([...chunk]);

    return chunks
}

///////////////////////////////////////////////////////////////
// Constants
///////////////////////////////////////////////////////////////

const TALLY_STATUS = {
    ProvisionalNotApproved: 0,
    ProvisionalApproved: 1,
    NotApproved: 2,
    Approved: 3,
    Enacted: 4,
};

const TALLY_PHASE = {
    Deliberation: 0,
    Revocation: 1,
    Ended: 2,
}

const VOTE_STATUS = {
    NotVoted: 0,
    Yay: 1,
    Nay: 2
}

const PROPOSAL_STATUS = {
    Created: 0,
    Submitted: 1,
    PartiallyExecuted: 2,
    FullyExecuted: 3
}

function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] == value);
}

function sleep(ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function execShellCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                throw new Error(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function execTask(cmd) {
    const execShellCommandOut = await execShellCommand(`${TASK_COMMAND_PREFIX} ${cmd}`);
    try {
        const ret = JSON.parse(execShellCommandOut);
        return ret;
    } catch (_) { }
    return execShellCommandOut;
}

///////////////////////////////////////////////////////////////

module.exports = {
    getAccountRoles,
    getGasPrice,
    deploymentParams,
    deployPohOracle,
    deployAssembly,
    deployToken,
    deployFaucet,
    deployAll,
    deployWalletTestable,
    deployImplementationContractPohOracle,
    deployImplementationContractAssembly,
    deployImplementationContractWallet,
    deployImplementationContractToken,
    deployImplementationContractFaucet,
    initializePohOracle,
    initializeAssembly,
    initializeWallet,
    initializeToken,
    initializeFaucet,
    initializeAll,
    buildPopulationScenario,
    buildSeatScenario,
    createProposal,
    submitTransaction,
    createTally,
    createAndApprove,
    SOME_UINT,
    DEFAULT_THRESHOLD,
    TALLY_STATUS,
    TALLY_PHASE,
    VOTE_STATUS,
    PROPOSAL_STATUS,
    getKeyByValue,
    REVERT_MESSAGES,
    ZERO_ADDRESS,
    GAS_LIMIT,
    distributeDelegationReward,
    makeMap,
    parseTally,
    formatTally,
    validateTallyState,
    createRandomAddress,
    pohRegisterBulk,
    chunk,
    sleep,
    execTask
};
