require("@nomicfoundation/hardhat-toolbox");

// Load environment variables from .env file
require("@chainlink/env-enc").config();
const { SEPOLIA_URL, PRIVATE_KEY ,ETHERSCAN_API_KEY, PRIVATE_KEY_ACC2} = process.env;

require("./tasks");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
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
  }

};
