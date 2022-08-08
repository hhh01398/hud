// Utilities to:
// - Retrieve the list of currently registered address in Proof of Humanity (PoH).
// - Retrieve the list of currently registered address in Humanity Unchained DAO's PoH oracle.
// - Compare both lists and return two lists with the differences.
// - Save/load the all lists into/from files.

const { readFileSync, writeFileSync } = require('fs');
const { post, get } = require('axios');
const { sleep } = require('./common')

var log = require('debug')('hud:oracle-utils')

const CONFIG = {
    SAVE_TO_FILES: true,
    READ_FROM_FILES: true,

    // Retrieving registration data from Proof of Humanity server
    HTTP_RESPONSE_FILE_PREFIX: 'poh_response_',
    LIST_ADDRESSES_FILE_PREFIX: 'poh_addresses_',
    SLEEP_SECONDS: 10,  // time between queries
    SLICE_SICE: 1000,   // max query size

    // Retriving blockchain transactions into PoH oracle smart contract
    BLOCKCHAIN_TXS_FILE: 'polygonscan-api-output.json',
    ORACLE_DEPLOYMENT_BLOCK_NUMBER: 26163109,
};

const FUNCTION_SIGNATURES = {
    "deregisterHuman(address)": "5b79bed8",
    "deregisterHumans(address[])": "b54bc8ea",
    "registerHuman(address)": "60872622",
    "registerHumans(address[])": "a68c8bee",
};

class PohExtractor {
    constructor() {
        this.storage = {}
        this.storage['files'] = {}
        this.storage['addresses'] = {}
        this.lastSliceData = null;
    }

    getParams(i) {
        const to = (i + 1) * CONFIG.SLICE_SICE;
        const from = i * CONFIG.SLICE_SICE;
        return {
            fileName: `${CONFIG.HTTP_RESPONSE_FILE_PREFIX}_${from}_${to}.json`,
            from: from,
            to: to
        };
    }

    async downloadSlice(i) {
        log(`Downloading PoH data slice no.${i} ...`);

        const params = this.getParams(i);
        var data;
        log(`Fetching from ${params.from} to ${params.to}...`);
        if (CONFIG.READ_FROM_FILES) {
            log(`Loading file ${params.fileName}...`);
            data = JSON.parse(readFileSync(params.fileName));
        } else {
            log(`Querying API server...`);
            const query = { "id": "indexQuery", "query": "query indexQuery(\n  $skip: Int = 0\n  $first: Int = 13\n  $where: Submission_filter = {removed: false}\n  $search: String = \"\"\n  $address: ID\n) {\n  contract(id: 0) {\n    ...submissionCardContract\n    id\n  }\n  submissions(orderBy: creationTime, orderDirection: desc, skip: $skip, first: $first, where: $where) {\n    id\n    ...submissionCardSubmission\n  }\n  contains: submissions(where: {name_contains: $search}) {\n    id\n    ...submissionCardSubmission\n  }\n  byAddress: submissions(where: {id: $address}) {\n    id\n    ...submissionCardSubmission\n  }\n  counter(id: 1) {\n    vouchingPhase\n    pendingRemoval\n    pendingRegistration\n    challengedRemoval\n    challengedRegistration\n    registered\n    expired\n    removed\n    id\n  }\n}\n\nfragment submissionCardContract on Contract {\n  submissionDuration\n}\n\nfragment submissionCardSubmission on Submission {\n  id\n  status\n  registered\n  submissionTime\n  name\n  disputed\n  requests(orderBy: creationTime, orderDirection: desc, first: 1, where: {registration: true}) {\n    evidence(orderBy: creationTime, first: 1) {\n      URI\n      id\n    }\n    id\n  }\n}\n", "variables": { "skip": params.from, "first": CONFIG.SLICE_SICE, "where": { "removed": false }, "search": "", "address": null } };
            const res = await post('https://gateway.thegraph.com/api/d98c97feb09f87d2d86956a815a5dbb5/subgraphs/id/0xb2a33ae0e07fd2ca8dbde9545f6ce0b3234dc4e8-0', query);
            data = res.data.data;
            log(`Response received!`);
        }
        if (CONFIG.SAVE_TO_FILES) {
            writeFileSync(params.fileName, JSON.stringify(data, null, 4));
            log(`Saved in file ${params.fileName}`);
        }
        this.storage['files'][params.fileName] = data;
        return data;
    }

    async downloadAll() {
        log(`Downloading PoH data...`);
        let i = 0;
        this.lastSliceData = '';
        try {
            while (true) {
                const data = await this.downloadSlice(i);
                if (JSON.stringify(data) == this.lastSliceData) {
                    log(`Reached end of data in server`);
                    break;
                }
                this.lastSliceData = JSON.stringify(data);
                if (!CONFIG.READ_FROM_FILES) {
                    log(`Waiting ${CONFIG.SLEEP_SECONDS} seconds for next query...`);
                    await sleep(CONFIG.SLEEP_SECONDS * 1000);
                }
                i++;
            }
        } catch (e) {
            console.error(`Error: ${e.stack}`);
        }
        return i;
    }

    async extract(numSlices) {
        let addresses = [];
        let addressesMap = {};

        log(`Extracting addresses from JSON data...`);
        for (var i = 0; i < numSlices; i++) {
            const params = this.getParams(i);
            var res;
            if (CONFIG.READ_FROM_FILES) {
                log(`Processing ${params.fileName} ...`);
                res = JSON.parse(readFileSync(params.fileName));
            } else
                res = this.storage['files'][params.fileName];

            var tmp = [];
            log(`Number of submissions in slice ${i + 1}/${numSlices} = ${res.submissions.length}`);
            for (var j = 0; j < res.submissions.length; j++) {
                if (res.submissions[j].registered) {
                    const address = res.submissions[j].id;
                    this.storage['addresses'][address] = res.submissions[j];
                    tmp.push(address);
                    addressesMap[address] = (addressesMap[address] || 0) + 1;
                }
            }
            addresses = addresses.concat(tmp);
        }

        addresses.reverse()

        log(`Total number of addresses            = ${addresses.length}`);
        if (CONFIG.SAVE_TO_FILES) {
            writeFileSync(CONFIG.LIST_ADDRESSES_FILE_PREFIX + 'poh.txt', addresses.join('\n'));
            writeFileSync(`map_${CONFIG.LIST_ADDRESSES_FILE_PREFIX}poh.txt`, JSON.stringify(addressesMap, null, 4));
        }
        return addresses;
    }

    async run() {
        const numSlices = await this.downloadAll();
        return await this.extract(numSlices);
    }
}


class HudExtractor {
    constructor(pohContractAddress) {
        this.pohContractAddress = pohContractAddress;
    }

    async downloadAll() {
        var txs;
        log(`Download HUD PoH oracle transaction data...`);
        if (CONFIG.READ_FROM_FILES) {
            log(`Reading from file ${CONFIG.BLOCKCHAIN_TXS_FILE}...`);
            txs = JSON.parse(readFileSync(CONFIG.BLOCKCHAIN_TXS_FILE));
        } else {
            if (typeof process.env.POLYGONSCAN_API_KEY == 'undefined')
                throw new Error('POLYGONSCAN_API_KEY environment variable undefined');

            const res = await get(`https://api.polygonscan.com/api?module=account&action=txlist&address=${this.pohContractAddress}&startblock=${CONFIG.ORACLE_DEPLOYMENT_BLOCK_NUMBER}&sort=asc&apikey=${process.env.POLYGONSCAN_API_KEY}`);
            txs = res.data;
        }

        if (CONFIG.SAVE_TO_FILES) {
            writeFileSync(CONFIG.BLOCKCHAIN_TXS_FILE, JSON.stringify(txs, null, 4));
            log(`Saved in file ${CONFIG.BLOCKCHAIN_TXS_FILE}...`);
        }


        log(`Extracting addresses from transactions...`);
        var addresses = {};
        for (var txIndex = 0; txIndex < txs.result.length; txIndex++) {
            const tx = txs.result[txIndex]
            log(`[${txIndex + 1}/${txs.result.length}] ${tx.hash}`);
            const functionSignature = tx.input.substring(2, 10);

            if ([FUNCTION_SIGNATURES['deregisterHumans(address)'], FUNCTION_SIGNATURES['registerHumans(address)']].indexOf(functionSignature) > -1) {
                throw (`Unsupported function signature ${functionSignature}`);
            }

            var arr = [FUNCTION_SIGNATURES['deregisterHumans(address[])'], FUNCTION_SIGNATURES['registerHumans(address[])']];
            if (!(arr.indexOf(functionSignature) > -1)) {
                log(`Irrelevant function signature ${functionSignature}. Ignoring...`);
                continue;
            }

            const input = tx.input.split("").reverse().join("");
            const txAddresses = input.match(/.{1,64}/g);
            const addressesTmp = []
            for (var addressIndex = 0; addressIndex < txAddresses.length - 3; addressIndex++) {

                var address = txAddresses[addressIndex];
                address = address.substring(0, 40);
                address = address.split("").reverse().join("");

                if (address.length == 40) {
                    address = '0x' + address
                    log(`[${txIndex + 1}/${txs.result.length}] ${tx.hash} [${addressIndex + 1}/${txAddresses.length}] ${address}`);
                    addressesTmp.push(address);
                } else {
                    throw (`Parameter does not look like an address: ${txAddresses[addressIndex]}`);
                }
            }

            addressesTmp.reverse()

            if ([FUNCTION_SIGNATURES['registerHumans(address[])']].indexOf(functionSignature) > -1) {
                log(`registerHumans(${addressesTmp.length} addresses)`);
                for (const address of addressesTmp)
                    addresses[address] = true;
            } else if ([FUNCTION_SIGNATURES['deregisterHumans(address[])']].indexOf(functionSignature) > -1) {
                log(`deregisterHumans(${addressesTmp.length} addresses)`);
                for (const address of addressesTmp)
                    delete addresses[address];
            } else {
                log(`Unknown function signature ${functionSignature}. Ignoring...`)
            }
        }
        addresses = Object.keys(addresses);
        log(`A total of ${addresses.length} addresses obtained`);
        if (CONFIG.SAVE_TO_FILES) {
            writeFileSync(CONFIG.LIST_ADDRESSES_FILE_PREFIX + 'hud.txt', addresses.join('\n'));
        }
        return addresses;
    }

    async run() {
        return await this.downloadAll();
    }
}


class OracleManager {
    constructor(pohContractAddress) {
        this.pohContractAddress = pohContractAddress;
        this.pohExtractor = new PohExtractor();
        this.hudExtractor = new HudExtractor(pohContractAddress);
    }

    diff(list1, list2) {
        const missingItems = list1.filter(x => !list2.includes(x));
        const newItems = list2.filter(x => !list1.includes(x));
        return {
            newItems,       // items in     list1 and not in list2
            missingItems    // items not in list1 and in     list2
        };
    }

    async retrieveAddressLists() {
        var pohList = await this.pohExtractor.run();
        var hudList = await this.hudExtractor.run();

        log(`pohList      = ${pohList}`);
        log(`hudList      = ${hudList}`);

        log(`Comparing lists...`);
        const diff = this.diff(hudList, pohList);
        log(`in     pohList AND NOT in hudList = ${JSON.stringify(diff.newItems)}`);
        log(`NOT in pohList AND     in hudList = ${JSON.stringify(diff.missingItems)}`);

        if (CONFIG.SAVE_TO_FILES) {
            writeFileSync(CONFIG.LIST_ADDRESSES_FILE_PREFIX + '_new.txt', diff.newItems.join('\n'));
            writeFileSync(CONFIG.LIST_ADDRESSES_FILE_PREFIX + '_missing.txt', diff.missingItems.join('\n'));

            // create a *_new.txt file again but including the submission dateTime for manual checking purposes
            const lines = [];
            for (const address of diff.newItems) {
                const data = this.pohExtractor.storage['addresses'][address];
                const dateTime = (new Date(data.submissionTime * 1000)).toISOString();
                lines.push([address, dateTime].join(','));
            }
            writeFileSync(CONFIG.LIST_ADDRESSES_FILE_PREFIX + '_new_data.txt', lines.join('\n'));
        }

        return {
            new: diff.newItems,         // list of addresses     registered in PoH but not registered in the oracle
            missing: diff.missingItems, // list of addresses not registered in PoH but     registered in the oracle 
        };
    }
}


async function retrieveAddressLists(pohContractAddress) {
    var oracleTxCreator = new OracleManager(pohContractAddress);
    return oracleTxCreator.retrieveAddressLists();
}


module.exports = {
    retrieveAddressLists
}