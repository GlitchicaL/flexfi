import { configVariable, defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          evmVersion: "paris",
          optimizer: {
            enabled: process.env.OPTIMIZER === "true" ? true : false,
            runs: process.env.RUNS ? Number(process.env.RUNS) : 200
          }
        }
      },
      {
        version: "0.8.28",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: process.env.OPTIMIZER === "true" ? true : false,
            runs: process.env.RUNS ? Number(process.env.RUNS) : 200
          }
        }
      },
    ],
  },
  networks: {
    mainnetFork: {
      type: "edr-simulated",
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/alch_l9v-U_cuRRtLnEQQjPBSg",
      },
    },
  },
  test: {
    mocha: {
      timeout: 20 * 60 * 1000,
    },
    solidity: {
      fuzz: {
        runs: 4,
      },
      invariant: {
        runs: 4,
        depth: 4,
        failOnRevert: true,
      },
    },
  },
});
