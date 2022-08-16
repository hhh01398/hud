# Test instructions

## Local

1. Run an local node:

```
yarn rpc-node
```

2. In another terminal, run the general tests:
```
yarn test
```

3. Once finished, in another terminal, run the upgrade tests:
```
sh scripts/upgrades/0/run_test_local.sh 
```

## Testnet

The steps explained for **Mainnet deployment** can be executed similarly on the Mumbai tesnet.


### Mainnet fork

Use [Alchemy](http://alchemy.com/) to spin up a fork mainnet on a particular block number:
```
export HARDHAT_NETWORK=hardhat
cp config.mainnet.json config.json
npx hardhat node --fork <YOUR_ALCHEMY_HTTPS_URL> --fork-block-number <A_RECENT_BLOCK_NUMBER>
```

Then, in another terminal, run:
```
sh scripts/upgrades/0/run_test_mainnet_fork.sh
```


## Mainnet deployment

Using the source code repository checked out on the current version, run:
```
WALLET_UPGRADE_ADDRESS=`yarn task _contracts-implementation-deploy --contract wallet`
```

Using the source code repository checked out on the previous version (that is, before the upgrade changes), run:
```
PROPOSAL_DATA=`yarn task _proposal-encode-upgrade --contract wallet --newimplementationaddress $WALLET_UPGRADE_ADDRESS`
PROPOSAL_ID=`yarn task _proposal-submit --recipient wallet --value 0 --data $PROPOSAL_DATA`
yarn task _tally-create --proposalid $PROPOSAL_ID
```