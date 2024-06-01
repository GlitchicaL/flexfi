# FlexFi

A demonstration of interacting with different DeFi applications on Ethereum.

## Technology Stack & Tools

- Solidity (Writing Smart Contract)
- Javascript (React & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [Alchemy](https://www.alchemy.com/) (Blockchain Connection)
- [Curve Fianance](https://curve.fi/#/ethereum/swap) (Defi Exchange)
- [Convex Finance](https://www.convexfinance.com/) (Staking Platform)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/). Recommended to use the latest LTS (Long-Term-Support) version, and preferably installing NodeJS via [NVM](https://github.com/nvm-sh/nvm#intro).
- Create an [Alchemy](https://www.alchemy.com/) account, you'll need to create an app for the Ethereum chain, on the mainnet network.

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:
`npm install`

### 3. Create .env
Refer to the *.env.example* file and create a *.env* with the following variables:
- **ALCHEMY_API_KEY=""**

These variables are not required but can be made for fine tuning:
- **BLOCK_NUMBER="18024700"**
- **OPTIMIZER="false"**
- **RUNS="200"**


## Running Tests
### 1. Run tests
`npx hardhat test`

### 2. (Optional) Run individual tests
In a separate terminal execute:
`npx hardhat test ./test/<name>.js`

## Running Scripts
### 1. Start Hardhat Node
In a separate terminal execute:
`npx hardhat node`

### 2. Start Hardhat Node
In a separate terminal execute:
`npx hardhat run scripts/<folder>/<name>.js --network localhost`