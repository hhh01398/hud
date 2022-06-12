const { types } = require('hardhat/config');
const { BN, time } = require('@openzeppelin/test-helpers');
const fs = require('fs');
require('@nomiclabs/hardhat-ethers');
const { TOKEN_SYMBOL } = require('../deployment-params');
const { retrieveAddressLists } = require('./oracle-utils');

const {
    TALLY_STATUS,
    TALLY_PHASE,
    VOTE_STATUS,
    getAccountRoles,
    deployAll,
    initializeAll,
    formatTally,
    getKeyByValue,
    pohRegisterBulk,
    chunk
} = require('./common');

var log = require('debug')('hud:task')

async function getConfig() {
    const config = require('../config.json');
    const accounts = [];
    (await hre.ethers.getSigners()).forEach(e => accounts.push(e.address));

    const ProofOfHumanityOracle = artifacts.require('ProofOfHumanityOracle')
    const Assembly = artifacts.require('Assembly')
    const MultiSigWallet = artifacts.require('Wallet')
    const Token = artifacts.require('Token')
    const Faucet = artifacts.require('Faucet')

    return {
        accounts: accounts,
        signer: accounts[config.signerIndex || 0],
        roles: getAccountRoles(accounts),
        poh: await ProofOfHumanityOracle.at(config.contractAddresses.poh),
        assembly: await Assembly.at(config.contractAddresses.assembly),
        wallet: await MultiSigWallet.at(config.contractAddresses.wallet),
        token: await Token.at(config.contractAddresses.token),
        faucet: await Faucet.at(config.contractAddresses.faucet),
        contractAddresses: config.contractAddresses,
    };
}

function getAddress(config, addressOrIndex) {
    if (addressOrIndex == '' || typeof addressOrIndex === 'undefined' || addressOrIndex === null)
        addressOrIndex = config.signer
    if (addressOrIndex.substring(0, 2) == '0x')
        return addressOrIndex;
    if (addressOrIndex == 'poh') return config.contractAddresses.poh;
    if (addressOrIndex == 'assembly') return config.contractAddresses.assembly;
    if (addressOrIndex == 'wallet') return config.contractAddresses.wallet;
    if (addressOrIndex == 'token') return config.contractAddresses.token;
    if (addressOrIndex == 'faucet') return config.contractAddresses.faucet;
    return config.accounts[parseInt(addressOrIndex)];
}

function formatBalance(balanceWei) {
    return [ethers.utils.formatEther(balanceWei.toString()), TOKEN_SYMBOL];
}

function parseBalance(balanceEther) {
    return new BN(`${ethers.utils.parseEther(balanceEther)}`);
}

function formatDatetime(timestamp) {
    return [parseInt(timestamp), new Date(timestamp * 1e3).toISOString()];
}

function out(obj, stringify = true) {
    if (stringify)
        console.log(JSON.stringify(obj, null, 4));
    else {
        console.log(obj);
    }
}

task('_get-config', 'Returns the system configuration (config.json)', async (args) => {
    const config = await getConfig();
    out({
        accounts: config.accounts,
        signer: config.signer,
        roles: config.roles,
        contractAddresses: config.contractAddresses,
    });
});

task('_get-dao-info', 'Returns various information of the state of the DAO', async (args) => {
    const config = await getConfig();

    const infoPoh = {
        'updater': await config.poh.getUpdater(),
        'upgrader': await config.poh.getUpgrader(),
        'submissionCount': parseInt(await config.poh.submissionCounter()),
        'humanCount': parseInt(await config.poh.getHumanCount()),
        'lastUpdateTimestamp': formatDatetime(await config.poh.getLastUpdateTimestamp()),
        'isTestMode': await config.poh.isTestMode(),
    };

    const referralRewardParams = await config.assembly.getReferralRewardParams();
    const infoAssembly = {
        'creator': await config.assembly.getCreator(),
        'owner': await config.assembly.getOwner(),
        'poh': await config.assembly.getPoh(),
        'wallet': await config.assembly.getWallet(),
        'faucet': await config.assembly.getFaucet(),
        'citizenCount': parseInt(await config.assembly.getCitizenCount()),
        'delegateCount': parseInt(await config.assembly.getDelegateCount()),
        'delegateSeats': await config.assembly.getDelegateSeats(),
        'getDelegateSeatAppointmentCounts': await config.assembly.getDelegateSeatAppointmentCounts(),
        'tallyCount': parseInt(await config.assembly.getTallyCount()),
        'seatCount': parseInt(await config.assembly.getSeatCount()),
        'votingPercentThreshold': parseInt(await config.assembly.getVotingPercentThreshold()),
        'citizenCountQuorum': parseInt(await config.assembly.getQuorum()),
        'tallyDuration': parseInt(await config.assembly.getTallyDuration()),
        'delegationRewardRate': formatBalance(await config.assembly.getDelegationRewardRate()),
        'referredAmount': formatBalance(referralRewardParams[0]),
        'referrerAmount': formatBalance(referralRewardParams[1]),
        'execRewardExponentMax': parseInt(await config.assembly.getExecRewardExponentMax()),
        'lastSnapshotTimestamp': formatDatetime(await config.assembly.getLastSnapshotTimestamp()),
        'isTestMode': await config.assembly.isTestMode(),
    };

    const infoWallet = {
        'assembly': await config.wallet.getAssembly(),
        'proposalCount': parseInt(await config.wallet.getProposalCount()),
        'isTestMode': await config.wallet.isTestMode(),
    };

    const infoToken = {
        'name': await config.token.name(),
        'symbol': await config.token.symbol(),
        'totalSupply': formatBalance(await config.token.totalSupply()),
        'reserveAddress': await config.token.getReserve(),
        'balanceOf(reserveAddress)': formatBalance(await config.token.balanceOf(await config.token.getReserve())),
        'governor': await config.token.getGovernor(),
        'upgrader': await config.token.getUpgrader(),
    }

    const infoFaucet = {
        'assembly': await config.faucet.getAssembly(),
        'wallet': await config.faucet.getWallet(),
        'token': await config.faucet.getToken(),
        'upgrader': await config.faucet.getUpgrader(),
        'faucetAddress': config.faucet.address,
        'balanceOf(faucetAddress)': formatBalance(await config.token.balanceOf(config.faucet.address)),
    }

    const ret = {
        poh: infoPoh,
        assembly: infoAssembly,
        wallet: infoWallet,
        token: infoToken,
        faucet: infoFaucet,
    }
    out(ret);
});

task('_get-address-info', 'Returns information of a given address', async (args) => {
    const config = await getConfig();
    const address = getAddress(config, args.address);
    const ret = {
        'address': address,
        'isHuman': await config.assembly.isHuman(address),
        'isCitizen': await config.assembly.isCitizen(address),
        'isDelegate': await config.assembly.isDelegate(address),
        'appointmentCount': await config.assembly.getAppointmentCount(address),
        'appointedDelegate': await config.assembly.getAppointedDelegate({ from: address }),
        'rewardBalance': formatBalance(await config.assembly.getRewardBalance(address)),
        'tokenBalance': formatBalance(await config.token.balanceOf(address)),
    };
    out(ret);
})
    .addParam('address', 'The address of the human or non-human');

task('_time-increaseto', 'Increases the EVM time', async (args) => {
    await time.increaseTo(parseInt(new BN(args.time)));
    out(formatDatetime((await time.latest()).toString()));
})
    .addParam('time', 'A UNIX timestamp')

task('_time-getlatest', 'Returns the current EVM time', async (args) => {
    out(formatDatetime((await time.latest()).toString()));
})

task('_humanity-set', "Registers the address as human's", async (args) => {
    const config = await getConfig();
    out((await config.poh.registerHuman(getAddress(config, args.address))).tx);
})
    .addParam('address', 'The address of the human');

task('_humanity-set-bulk', "Registers the address as human's", async (args) => {
    const config = await getConfig();
    const addresses = fs.readFileSync(args.inputfile, { encoding: 'ascii' }).split('\n');
    out(await pohRegisterBulk(config.poh, addresses, args.numaddressespertransaction, getAddress(config, 0)));
})
    .addParam('inputfile', 'The path to the file containing a list of addresses')
    .addOptionalParam('numaddressespertransaction', 'Send addresses in smaller slices', 200, types.int);

task('_delegate-apply', 'Apply for delegation', async (args) => {
    const config = await getConfig();
    out((await config.assembly.applyForDelegation({ from: getAddress(config, args.from) })).tx);
})
    .addOptionalParam('from', 'The human to become a delegate', '', types.string)

task('_citizen-apply', 'Apply for citizenship', async (args) => {
    const config = await getConfig();
    out((await config.assembly.applyForCitizenship({ from: getAddress(config, args.from) })).tx);
})
    .addOptionalParam('from', 'The human to become a citizen', '', types.string)

task('_delegate-appoint', 'Appoint a delegate', async (args) => {
    const config = await getConfig();
    out((await config.assembly.appointDelegate(getAddress(config, args.delegate), { from: getAddress(config, args.from) })).tx);
})
    .addParam('delegate', 'The address of the delegate')
    .addOptionalParam('from', 'The human to appoint the delegate', '', types.string)

task('_delegate-claimseat', 'Claim a given seat number', async (args) => {
    const config = await getConfig();
    out((await config.assembly.claimSeat(args.seatnum, { from: getAddress(config, args.from) })).tx);

})
    .addParam('seatnum', 'The seat number to claim')
    .addOptionalParam('from', 'The requester', '', types.string)

task('_proposal-encode-distrust', 'Distrust an address', async (args) => {
    const config = await getConfig();
    const abi = config.assembly.contract.methods.distrust(getAddress(config, args.address)).encodeABI();
    out(abi);
})
    .addParam('address', 'The address to distrust');

task('_proposal-encode-expel', 'Expels a human from the DAO', async (args) => {
    const config = await getConfig();
    const abi = config.assembly.contract.methods.expel(getAddress(config, args.address)).encodeABI();
    out(abi);
})
    .addParam('address', 'The address of the human');

task('_proposal-encode-sendtoken', 'Transaction bytecode to set send tokens from and to the given address', async (args) => {
    const config = await getConfig();
    const abi = config.token.contract.methods.governorSend(
        await config.token.getReserve(),
        getAddress(config, args.recipient),
        new BN(args.value),
        []).encodeABI();
    out(abi, stringify = false);
})
    .addParam('recipient', 'Who receives the tokens')
    .addParam('value', 'Number of tokens in minimal units')

task('_proposal-encode-setReferralRewardParams', 'Transaction bytecode to set the referral reward parameters', async (args) => {
    const config = await getConfig();
    const abi = config.assembly.contract.methods.setReferralRewardParams(new BN(args.referredamount), new BN(args.referreramount)).encodeABI();
    out(abi);
})
    .addParam('referredamount', 'Number of token units for the referred address')
    .addParam('referreramount', 'Number of token units for the referrer address');


task('_proposal-encode-setExecRewardExponentMax', 'Transaction bytecode to set the execution reward parameters', async (args) => {
    const config = await getConfig();
    const abi = config.assembly.contract.methods.setExecRewardExponentMax(args.value).encodeABI();
    out(abi);
})
    .addParam('value', 'Maximum exponent of the execution reward exponential function')


task('_proposal-encode-registerHumans', 'Bulk registration of addresses belonging to humans', async (args) => {
    const config = await getConfig();
    const addresses = args.addresses.split(',')
    const abi = config.poh.contract.methods.registerHumans(addresses).encodeABI();
    out(abi);
})
    .addParam('addresses', 'Addresses belonging to humans');

task('_proposal-encode-deregisterHumans', 'Bulk deregistration of addresses no longer belonging to humans', async (args) => {
    const config = await getConfig();
    const addresses = args.addresses.split(',')
    const abi = config.poh.contract.methods.deregisterHumans(addresses).encodeABI();
    out(abi);
})
    .addParam('addresses', 'Addresses belonging to non-humans');

task('_proposal-batch-update-oracle-poh', 'Create a batch of transactions to keep the oracle in sync with Proof of Humanity\'s registry', async (args) => {
    const config = await getConfig();
    const addresses = await retrieveAddressLists(config.contractAddresses.poh);
    const maxnumadressespertx = parseInt(args.maxnumadressespertx);

    const txBatch = {
        registerHumans: {},
        deregisterHumans: {},
    }

    log(`Generation of transactions for newly REGISTERED addresses: Splitting ${addresses.new.length} addresses into chunks of ${maxnumadressespertx} addresses max`);
    var chunks = chunk(addresses.new, maxnumadressespertx);
    log(`chunks.length = ${chunks.length}`);
    for (let i = 0; i < chunks.length; i++) {
        log(`chunks[${i}].length = ${chunks[i].length}`);
        txBatch.registerHumans[i] = config.poh.contract.methods.registerHumans(chunks[i]).encodeABI();
    }

    log(`Generation of transactions for newly UNREGISTERED addresses: Splitting ${addresses.missing.length} addresses into chunks of ${maxnumadressespertx} addresses max`);
    chunks = chunk(addresses.missing, maxnumadressespertx);
    log(`chunks.length = ${chunks.length}`);
    for (let i = 0; i < chunks.length; i++) {
        log(`chunks[${i}].length = ${chunks[i].length}`);
        txBatch.deregisterHumans[i] = config.poh.contract.methods.deregisterHumans(chunks[i]).encodeABI();
    }

    out(txBatch);
})
    .addParam('maxnumadressespertx', 'Set maximum number of addresses contained in a transaction', '200', types.string)

task('_proposal-encode-upgrade', 'Upgrade contract', async (args) => {
    const config = await getConfig();
    const abi = config[args.contract].contract.methods.upgradeTo(args.newimplementationaddress).encodeABI();
    out(abi);
})
    .addParam('contract', 'The contract to upgrade: poh, assembly, wallet, token or faucet')
    .addParam('newimplementationaddress', 'The address of the new implementation contract');

task('_proposal-submit', 'Submit a transaction proposal to the wallet contract', async (args) => {
    const config = await getConfig();

    const value = args.value ? new BN(args.value) : new BN('0');
    const receipt = await config.wallet.submitProposal(getAddress(config, args.recipient), value, args.data, { from: getAddress(config, config.signer) });
    const proposalId = parseInt(receipt.logs[0].args.proposalId.valueOf());
    out(proposalId);
})
    .addParam('recipient', 'The recipient address')
    .addOptionalParam('value', 'The value of the transaction in wei (e.g. 1000000000000000000 for 1 ether)', '0', types.string)
    .addOptionalParam('data', 'The transaction data in hex format (e.g. 0x0)', '0x', types.string);

task('_proposal-get', 'Gets the transaction proposal details', async (args) => {
    const config = await getConfig();
    const p = await config.wallet.getProposal(args.proposalid)
    const proposal = {
        destination: p[0],
        value: p[1],
        data: p[2],
        executed: p[3],
    }
    out(proposal);
})
    .addParam('proposalid', 'The proposal id')

task('_tally-create', 'Creates a new tally for a given transaction', async (args) => {
    const config = await getConfig();
    const receipt = await config.assembly.createTally(args.proposalid, { from: getAddress(config, config.signer) });
    const tallyId = parseInt(receipt.logs[0].args.tallyId.valueOf());
    out(tallyId);
})
    .addParam('proposalid', 'The transaction id number to tally on');

task('_tally-get', 'Gets the tally details', async (args) => {
    const config = await getConfig();
    let tally = await config.assembly.getTally(args.tallyid);
    tally = formatTally(tally);
    tally.submissionTime = formatDatetime(tally.submissionTime);
    tally.revocationStartTime = formatDatetime(tally.revocationStartTime);
    tally.votingEndTime = formatDatetime(tally.votingEndTime);
    tally.status = getKeyByValue(TALLY_STATUS, tally.status);
    tally.phase = getKeyByValue(TALLY_PHASE, parseInt(await config.assembly.getTallyPhase(args.tallyid)));
    out(tally);
})
    .addParam('tallyid', 'The tally to get data from')

task('_tally-get-vote', 'Gets the tally details', async (args) => {
    const config = await getConfig();
    let delegateVote, citizenVote;
    try {
        delegateVote = await config.assembly.getDelegateVote(args.tallyid, { from: getAddress(config, args.from) });
    } catch (_) { }
    try {
        citizenVote = parseInt(await config.assembly.getCitizenVote(args.tallyid, { from: getAddress(config, args.from) }));
    } catch (_) { }
    const ret = {
        delegateVote: delegateVote,
        citizenVote: [citizenVote, getKeyByValue(VOTE_STATUS, citizenVote)],
    };
    out(ret);
})
    .addParam('from', 'The requester of the operation', '', types.string)
    .addParam('tallyid', 'The tally to get data from');

task('_tally-delegate-vote', 'Cast a vote on a given tally as a delegate', async (args) => {
    const config = await getConfig();
    const vote = parseInt(args.vote)
    out((await config.assembly.castDelegateVote(args.tallyid, vote == 1, { from: getAddress(config, args.voter) })).tx);
})
    .addParam('tallyid', 'The tally in question')
    .addParam('vote', '1 for yes, 0 for no')
    .addParam('voter', 'The address of the delegate');

task('_tally-citizen-vote', 'Cast a vote on a given tally as a citizen', async (args) => {
    const config = await getConfig();
    const vote = parseInt(args.vote)
    out((await config.assembly.castCitizenVote(args.tallyid, vote == 1, { from: getAddress(config, args.voter) })).tx);
})
    .addParam('tallyid', 'The tally in question')
    .addParam('vote', '1 for yes, 0 for no')
    .addParam('voter', 'The address of the citizen');

task('_tally-tallyUp', 'Counts the votes of the given tally', async (args) => {
    const config = await getConfig();
    out((await config.assembly.tallyUp(args.tallyid, { from: getAddress(config, args.from) })).tx);
})
    .addParam('tallyid', 'The tally to compute')
    .addOptionalParam('from', 'The signer of the operation', '', types.string);

task('_tally-enact', 'Executes the tally transaction proposal if approved', async (args) => {
    const config = await getConfig();
    out((await config.assembly.enact(args.tallyid, { from: getAddress(config, args.from) })).tx);
})
    .addParam('tallyid', 'The tally to enact')
    .addOptionalParam('from', 'The signer of the operation', '', types.string);

task('_tally-execute', 'Performs both counting votes and executing the transaction proposal (if approved) of a given tally', async (args) => {
    const config = await getConfig();
    out((await config.assembly.execute(args.tallyid, { from: getAddress(config, args.from) })).tx);
})
    .addParam('tallyid', 'The tally to process')
    .addOptionalParam('from', 'The signer of the operation', '', types.string);

task('_token-distributeDelegationReward', 'Takes a snapshot of the seats and distributes the reward among the delegates accordingly', async (args) => {
    const config = await getConfig();
    out((await config.assembly.distributeDelegationReward({ from: getAddress(config, args.signer) })).tx);
})

task('_token-claimRewards', "Transfer any earned rewards except referral's", async (args) => {
    const config = await getConfig();
    out((await config.assembly.claimRewards({ from: getAddress(config, args.address) })).tx);
})
    .addOptionalParam('address', 'The address to claim the rewards for')

task('_token-claimReferralReward', 'Transfer any earned referral rewards', async (args) => {
    const config = await getConfig();
    out((await config.assembly.claimReferralReward(getAddress(config, args.referrer), { from: getAddress(config, args.from) })).tx);
})
    .addOptionalParam('referrer', 'The address to claim the reward for')
    .addOptionalParam('from', 'The signer of the operation', '', types.string);

task('_token-get-balance', 'Returns the balance in tokens of a given address', async (args) => {
    const config = await getConfig();
    const address = getAddress(config, args.address);
    const balance = await config.token.balanceOf(address);
    out(formatBalance(balance));
})
    .addOptionalParam('address', 'The address from which to check the balance')

task('_contracts-deploy', 'Deploys a whole new instance of contracts', async (args) => {
    [poh, assembly, wallet, token, faucet] = await deployAll(artifacts, { testable: args.testable });
    const ret = {
        contractAddresses: {
            poh: poh.address,
            assembly: assembly.address,
            wallet: wallet.address,
            token: token.address,
            faucet: faucet.address,
        }
    };

    out(ret);
    if (args.output) fs.writeFileSync(args.output, JSON.stringify(ret, null, 4));

    if (args.testable) {
        await poh.setTestMode(true);
        await assembly.setTestMode(true);
        await wallet.setTestMode(true);
    }
})
    .addOptionalParam('testable', 'Deploy testable contracts (Note: do *NOT* use this in production!)', false, types.boolean)
    .addOptionalParam('output', 'The output file where to write the configuration file containing the contract addresses', 'config.json', types.string)

task('_contracts-initialize', 'Initializes all contracts', async (args) => {
    const config = await getConfig();
    await initializeAll(config.poh, config.assembly, config.wallet, config.token, config.faucet, config.roles);
    out('OK');
});

module.exports = {
    getConfig,
    parseBalance,
}
