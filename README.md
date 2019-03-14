# Digivice
A collection of smart contracts for various types of on-chain registries.

---
## Status

[ ![Codeship Status for luciditytech/digivice](https://app.codeship.com/projects/bb3ae590-a8f5-0136-761d-2e2cf4f8517e/status?branch=master)](https://app.codeship.com/projects/308664)

## Prerequisites

1. [brew](http://brew.sh)

  ```sh
  ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ```

1. [HubFlow](http://datasift.github.io/gitflow/)

  ```sh
  brew install hubflow
  ```

> If you are on Linux

  ```sh
  git clone https://github.com/datasift/gitflow
  cd gitflow
  sudo ./install.sh
  ```

---

## Setup

1. `npm install -g truffle solhint`
  * [IDE Integrations for solhint](https://github.com/protofire/solhint#ide-integrations)
1. `git clone git@github.com:luciditytech/digivice.git`
1. `npm install`
1. `git hf init`

---

## Compiling and migrating smart contracts

1. `truffle compile`
1. `truffle migrate`

---

## Testing smart contracts

> Be sure compiled contracts are latest before testing
1. `npm run lint`
1. `npm run test`
1. With code coverage: `npm run coverage`

---

## Linting smart contracts
1. `solhint "contracts/**/*.sol"`

## Contract addresses

* development: [0xd209f28511f37e3e975d4631b7cfa2f52ffabcef](https://ropsten.etherscan.io/address/0xd209f28511f37e3e975d4631b7cfa2f52ffabcef#readContract)
* production: [0x614cb086657c47739068c12eeff43a4018be1190](https://ropsten.etherscan.io/address/0x614cb086657c47739068c12eeff43a4018be1190#readContract)
