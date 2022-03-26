require('@nomiclabs/hardhat-truffle5');
require('hardhat-erc1820');
require('hardhat-gas-reporter');
require('solidity-coverage');

require("./scripts/hardhat-tasks");

const ACCOUNTS_COUNT = 30;
const {
  MNEMONIC_HARDHAT, MNEMONIC_TESTNET, MNEMONIC_MAINNET,
  PASSPHRASE_HARDHAT, PASSPHRASE_TESTNET, PASSPHRASE_MAINNET
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 600000,
  },
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
      timeout: 600000,
      allowUnlimitedContractSize: false,
      accounts: {
        mnemonic: `${MNEMONIC_HARDHAT}`,
        passphrase: `${PASSPHRASE_HARDHAT}`,
        count: ACCOUNTS_COUNT,
      }
    },
    testnet: {
      url: "https://matic-mumbai.chainstacklabs.com",
      timeout: 3600000,
      chainId: 80001,
      accounts: {
        mnemonic: `${MNEMONIC_TESTNET}`,
        passphrase: `${PASSPHRASE_TESTNET}`,
        count: ACCOUNTS_COUNT,
      }
    },
    mainnet: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: {
        mnemonic: `${MNEMONIC_MAINNET}`,
        passphrase: `${PASSPHRASE_MAINNET}`,
        count: ACCOUNTS_COUNT,
      }
    },
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    ethPrice: "1"
  }
};
