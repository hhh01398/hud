Humanity Unchained DAO frontend
=====

This is a web frontend implemented in Flutter for interacting with Humanity Unchained DAO smart contracts. Follow these steps to run it on your machine.

# <a name="runLocally"></a> Quickstart

## Step 1: Setting environment

 The following software has been used for development:

```console
$ flutter doctor
[✓] Flutter (Channel stable, 2.5.3, on Debian GNU/Linux 11 (bullseye) 5.10.0-9-amd64, locale en_US.UTF-8)
```

Clone this repo and and install the project dependencies.

```console
$ git clone https://github.com/hhh01398/hud
$ cd hud/frontend
$ flutter pub get
```

## Step 2 (optional): Set the contract addresses

If you are running a local RPC node, you need to:

1. Set the addresses of the contracts in `lib/constants.dart`.
2. Configure your browser's web3 wallet to connect to your localhost RPC node. By default, you would need to set the following parameters:

```
RPC URL : http://localhost:8545
Chain ID: 31337
```

NOTE: that you might want use the same addresses in your web3 wallet as in `smart_contracts/hardhat.config.js`.

## Step 3: Build

```console
./scripts/build.sh
```

## Step 4: Run web server

To run an instance of the web server:

```console
./scripts/run_server.sh
```

Open `http://localhost:5000` in your browser.
