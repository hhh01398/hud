Humanity Unchained DAO smart contracts
=====

# Description

Humanity Unchained DAO's smart contract architecture consists of the following smart contracts:

|Contract|Description|
--- | --- |
|Proof of Humanity Oracle|Contains a copy of the sybil-proof list of addresses from the official Proof of Humanity contract on the Ethereum mainnet. The updating process requires the `DAO`'s approval itself.
|Assembly|Handles the citizen and delegate registration, creation of tallies, voting, etc.
|Wallet|It supports any asset. It is governed by the `Assembly`, which means that assets can be transferred out only under the `Assembly`'s approval through a voting process. It also stores a list of proposed transactions whose execution is to be approved (or rejected) by the `Assembly`.
|Token|An ERC777-compliant implementation of the HUD token. The `Assembly` can approve transaction executions to call the `Token` contract functions via the `Wallet` contract, just like for any other contract. The `Token` contract enables the DAO to lock and forcibly transfer HUD.
|Faucet|Serves as convenient *pocket money* recipient for automated transactions of small amounts of HUD without requiring a DAO's voting.

<img src="../assets/overall_diagram.png" alt="Contract architecture" height="400px">

Proposals can contain any number of steps. Steps are executed sequentially. Each step can contain any number of transactions, as far as the gas of all such transactions is lower than the block gas limit as transactions in the same step are executed in the same block.

Take the following as an example:

1. Create proposal containing:

```
Step1: Transaction1a, Transaction1b, Transaction1c
Step2: Transaction2
Step3: Transaction3a, Transaction3b
```

2. Create tally to vote proposal.

3. If tally is Approved, then an executor will be able to execute the transactions step by step, that is:

```
Block1: Step1: Transaction1a, Transaction1b, Transaction1c
Block2: Step2: Transaction2
Block3: Step3: Transaction3a, Transaction3b
```

where `Block3.number` > `Block2.number` > `Block1.number`

The workflow of voting and execution of proposals is as follows:

**Step 1: A transaction proposal is submitted for review**

Any member of the DAO can submit a proposal to the DAO. This is done by submitting a transaction proposal to the `Wallet` contract. After that, members of the DAO can cast their votes on the proposal.

Currently, transaction proposals can only be submitted [through the command line](#runTasks).

<img src="../assets/submitProposal.png" alt="Submit a proposal" height="400px">

**Step 2: The community votes on the transaction proposal**

The voting process is divided into two phases: *deliberation* and *revocation*. Delegates cannot cast votes during the revocation period, **only citizens**. This guarantees citizens the chance to push back any decision from the delegates.

<img src="../assets/castVote_delegates.png" alt="Delegates cast their votes" height="400px">

<img src="../assets/castVote_citizens.png" alt="Citizens cast their votes" height="400px">

Any time during the tally, anyone can call the contrat function to count the votes and update the tally status. This is called *tallying up*.

```console
yarn task _tally-tallyUp --tallyid <TALLY_ID> --gaslimit <GAS_LIMIT> # Counts the votes and updates the status of a given tally
```

When doing a call to tally up, both the delegate votes and citizens votes are computed. Note that, with regard to the delegate votes, the number of citizen appointments of the seated delegates at that time is taken, which can change regardless of the votes.


**Step 3: The proposal is approved and executed**

If the final result of the voting is `Approved`, the proposal can now be executed.

<img src="../assets/execute_send.png" alt="Execute proposal" height="100px">

The proposal execution can be done through either of the following two ways:

```console
yarn task _tally-enact --tallyid <TALLY_ID> --gaslimit <GAS_LIMIT> # Executes the tally transaction proposal (if approved)

or

yarn task _tally-execute --enact  <TALLY_ID> --gaslimit <GAS_LIMIT> # Performs both counting votes and executing the transaction proposal (if approved)  of a given tally
```

Then above functions can execute one step at a time. Therefore, in order to fully execute a proposal, the functions need to be called at least as many times as steps that the proposal has.

# Setting environment

The following Solidity smart contracts have been developed on a Debian-based operating system with the following `node.js` and `yarn` versions:

```console
$ node --version
v12.22.5
$ yarn --version
1.22.17
```

To start with, clone this repo and run `yarn` to install the the project dependencies:

```console
$ git clone https://github.com/hhh01398/hud
$ cd hud/backend
$ yarn
```

# Run tests

Simply run:

```console
$ yarn test
```


# <a name="runTasks"></a> Tasks

A number of commands are executable via command line as Hardhat tasks, instead of or complementary to the frontend. These operations are typically not to be performed by `citizens` but rather by `delegates` or arbitrageurs. For a list of available tasks, run:

```console
$ yarn task
```

To run a task:

```console
$ yarn task <TASK_NAME> <TASK_PARAMS>
```

The tasks make use of the settings in `config.json`. The `localhost` network is used by default. To use any other of the networks configured in `hardhat.config.js`, set the `HARDHAT_NETWORK` environment variable to the name of the network. For example:

```console
export HARDHAT_NETWORK=mainnet
```

# Submit proposals

The process to submit transaction proposals consist of:

1.  Create a proposal.
2a. Create the transaction in hexadecimal format.
2b. Submit the transaction in hexadecimal format to the proposal. Allocate the transaction in the desired step.
2c. Repeat 2a and 2b for as many transactions as required, otherwise continue.
3. Submit the proposal.


Example: Send 100 HUD to the address 0x1234 and 200 HUD to the address 0x5678

```console
> yarn --silent task _proposal-create
126
> yarn --silent task _transaction-submit --proposalid 126 --stepnum 0 --recipient token --value 0 --data `yarn --silent task _transaction-encode-sendtoken --recipient 0x1234 --value 100000000000000000000`
1893
> yarn --silent task _transaction-submit --proposalid 126 --stepnum 1 --recipient token --value 0 --data `yarn --silent task _transaction-encode-sendtoken --recipient 0x5678 --value 200000000000000000000`
1894
> yarn --silent task _proposal-submit --proposalid 126
2
```

The command `_transaction-encode-sendtoken --recipient 0x1234 --value 100000000000000000000` returns an hexadecimal string that corresponds to a transaction transferring 100 HUD (= 100 * 1e18) to the address 0x1234.

The command `_transaction-submit --recipient token --value 0 --data` will submit the transaction proposal's hexadecimal to the `wallet` contract. The command indicates that the transaction must, if approved, be sent to the `token` contract, with a value of 0 MATIC and with the generated hexadecimal string as attached data.

More examples can be found in the `test` folder.


# Delegation

Delegation refers to the role of casting your vote on transaction proposals on behalf of your appointing citizens. Delegates get paid tokens for their work if they sit on a *seat*, for which they need to claim it first:

```console
$ yarn task _delegate-claimseat --seatnum <SEAT_NUMBER> --delegate <DELEGATE_ADDRESS>
```

A delegate who claims a seat will be granted the seat either if the seat is empty or the seat was occupied by another delegate with less citizens.

The number of tokens that a delegate gets paid is proportional to the number of citizens that appointed the delegate over a period of time. The rewards are calculated and distributed taken into consideration the appointment distribution at the time of the last calculation. This is why it is needed for delegates to trigger the reward distribution to start accruing tokens.

```console
$ yarn task _token-distributeDelegationReward
```

# Gas-Intensive Operations

Some DAO operations are costly as they require a substancial amount of gas to be executed. To avoid citizens and delegates bearing the cost of these gas fees, the DAO allows anyone to perform these operations instead and get rewarded in tokens in exchange for the work. These operation are:

- Tallying: It refers to the process of counting the votes of a specific tally.
- Enacting: It refers to the execution of a approved transaction.

A voting on a transaction proposal starts by creating a tally:

```console
$ yarn task _tally-create --tallyid <TALLY_ID>
```

As time passes, `delegates` and `citizens` may cast their votes. To check the status of the tally:

```console
$ yarn task _tally-get --tallyid <TALLY_ID>
```

After the tally expiration time, the votes need to be tallied up and, if the proposal was approved, the transaction needs to be executed. The number of tokens to be paid as enaction reward increases exponentially as time passes until a maximum is reached, thus the price of the transaction is automatically determined as any executor in the market will perform the operation when the reward is profitable enough.

```console
$ yarn task _tally-execute --tallyid <TALLY_ID> --gasLimit <GAS_LIMIT>
```

Hardhat's transaction gas limit estimation might be lower than the needed one. To use a higher gas limit value, use the `gasLimit` flag.

# Collecting rewards

Rewards from delegation work or gas-intensive operations can be collected anytime:

```console
$ yarn task _token-claimRewards --address <YOUR_ADDRESS>
```

<img src="../assets/claimReward.png" alt="Claim reward tokens" height="350px">

# Updating the Proof of Humanity oracle

To update the oracle contract with the latest registered addresses in *Proof of Humanity* oracle, we first need to compare the addresses in both Proof of Humanity and the oracle. Then, the transaction proposal to effectively perform the update needs to be approved by the DAO.

To generate a list of transacions to register and unregister the corresponding addresses in the oracle, run:

```console
$ DEBUG=hud* POLYGONSCAN_API_KEY=<YOUR_KEY> yarn task _proposal-batch-update-oracle-poh --maxnumadressespertx <NUM_ADDRESSES>
```

This task will do the following:

1. Retrieve the current list of register addresses in Proof of Humanity via querying PoH's server.
2. Retrieve the current list of register addresses in the oracle by analyzing the transactions to the oracle using Polygonscan's API.
3. Compare both address lists and create two lists of transactions, to register and to unregister addresses, to be submited to the DAO for approval.

Use `DEBUG=hud*` to print out logs. `<YOUR_KEY>` is the [Polygon's account API KEY](https://polygonscan.com/). `<NUM_ADDRESSES>` is the maximum number of addresses to update in a single transaction proposal. Beware that a too large number of addresses might result in a transaction that would exceed the chain's block gas limit and could not be included in a block. It is recommended to choose a number that would **not exceed 50% of the block gas limit**.

To submit the transaction, run:

```
$ yarn task _proposal-submit --recipient poh --data "<TRANSACTION>"
```

# <a name="runLocally"></a> Development

Follow these steps to run your own Humanity Unchained DAO DAO instance.

## Step 1: Run local RPC node

Start a local RPC node:

```console
$ yarn rpc-node
```

## Step 2: Deploy and initialize contracts

In another terminal, deploy and initialize the smart contracts:
```console
$ yarn task _contracts-deploy && \
  yarn task _contracts-initialize && \
  yarn task _get-dao-info
```

Your DAO is ready to be used.


## Step 3: Add population

Now you probably want to add some citizens and delegates. To do that, first you need to set the humanity for the addresses:
```console
$ yarn task _humanity-set --address ADDRESS
```

*ADDRESS* can be either an address or the address number (and integer) corresponding to the seed phrase in `hardhat.config.js`.

## Next steps

You can now run different tasks to create delegates, transactions, tallies, etc.

# Smart contract verification

You may verify that the smart contract's deployed bytecode corresponds to its source code or, alternatively, trust [Polygonscan](https://polygonscan.com).

Keep in mind that, because the contracts follow the [EIP1967 standard](https://eips.ethereum.org/EIPS/eip-1967), the smart contract addresses the user interacts with are those of the proxy contracts, not the contract containing the actual logic.

For example, to verify the [proxy contract](https://polygonscan.com/address/0x5E73040E4eac787c0b749048Ba104660315C04e3) of the [Assembly contract](https://polygonscan.com/address/0x95c02c0fe6c5becf2d7834928ff0f59e3dce6bab) can be done checking:

1. The [code verification of the Asssembly contract](https://polygonscan.com/address/0x95c02c0fe6c5becf2d7834928ff0f59e3dce6bab#code)
2. The [code verification of the proxy contract](https://polygonscan.com/address/0x5E73040E4eac787c0b749048Ba104660315C04e3#code)
3. The [proxy contract was initialized with the address of the Assembly contract](https://polygonscan.com/address/0x5E73040E4eac787c0b749048Ba104660315C04e3#events):

![Constructor Arguments](./assets/constructor_arguments.png)

Also note that, at the time of writting, [Polygonscan](https://polygonscan.com) does not support reading and writing to a contract from its ERC1967Proxy contract.
