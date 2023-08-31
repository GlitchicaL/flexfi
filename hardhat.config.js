require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/**
 * See documentation for additional configuration options:
 * https://hardhat.org/hardhat-runner/docs/config
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: process.env.OPTIMIZER === "true" ? true : false,
        runs: process.env.RUNS ? Number(process.env.RUNS) : 200
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: process.env.BLOCK_NUMBER ? Number(process.env.BLOCK_NUMBER) : undefined
      }
    }
  }
};
