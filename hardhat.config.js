require("@nomicfoundation/hardhat-toolbox");
// Load environment variables from .env file
require("@chainlink/env-enc").config();
require('hardhat-deploy');
require("./tasks");
require('@nomicfoundation/hardhat-chai-matchers');
require('@nomicfoundation/hardhat-ethers');
require('@typechain/hardhat');
require('hardhat-gas-reporter');
require('solidity-coverage');

const { SEPOLIA_URL, PRIVATE_KEY ,ETHERSCAN_API_KEY, PRIVATE_KEY_ACC2} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",

  mocha: {
    timeout: 300000,
  },

  networks: {
    sepolia:{
      // Alchemy,Infura,QuickNode,etc.
      url: SEPOLIA_URL,
      accounts:[PRIVATE_KEY, PRIVATE_KEY_ACC2],
      chainId: 11155111
    }
  },

  etherscan: {
    apiKey: {
      sepolia:ETHERSCAN_API_KEY
    }
  },

  namedAccounts: {
    firstAccount: {
      default: 0, // here 0 is the index of the account in the accounts array
    },
    secondAccout: {
      default: 1, // here 1 is the index of the second account in the accounts array
    } 
  },

  // Set to true to enable gas reporting
  gasReporter: {
    enabled: false, 
  }

};
