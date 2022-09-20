import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: process.env.INFURA_URL,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    goerli: {
      url: process.env.INFURA_URL,
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY

    // npx hardhat verify --network rinkeby 0x12818AE2dBc11F94543A4EA79d52E4dDF5F1eC90 1663241299 1665833299 "0xC146E1aB66cda6d949FdAAb23E45AEC0e16EfAd7"
  },
};

export default config;
