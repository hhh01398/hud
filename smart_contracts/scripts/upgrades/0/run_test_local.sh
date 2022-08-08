#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  if [ -z ${hardhat_pid+x} ]; then
    echo "Quitting"
  else
    echo "Killing hardhat node instance..."
    # Kill the hardhat node instance that we started (if we started one and if it's still running).
    if [ -n "$hardhat_pid" ] && ps -p $hardhat_pid > /dev/null; then
      kill -9 $hardhat_pid
    fi

    while hardhat_running; do
      sleep 0.1
    done
    echo "Hardhat stopped!"
  fi
}

hardhat_port=8545

hardhat_running() {
  nc -z localhost "$hardhat_port"
}

start_hardhat() {
  echo "Starting our own hardhat instance"
  node_modules/.bin/hardhat node > /dev/null &
  hardhat_pid=$!

  echo "Waiting for hardhat node to launch on port "$hardhat_port"..."
  while ! hardhat_running; do
    sleep 0.1
  done
  echo "Hardhat launched!"
}

run_own_hardhat=true
if hardhat_running; then
  echo "Using existing hardhat instance"
  run_own_hardhat=false
else
  start_hardhat
fi

for contract in upgrade0_local; do
  node_modules/.bin/hardhat --network localhost test test/upgrades/$contract.js
  if [ $run_own_hardhat = true ]; then
    cleanup
    start_hardhat
  fi
done
