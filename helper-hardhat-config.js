const DECIMAL = 8;
const INITIAL_ANSWER = 300000000000;
const LOCKTIME = 180;
const WAIT_CONFIRMATIONS = 5;
const DEVELOPMENT_CHAIN = ["hardhat", "localhost"];

const NETWORK_CONFIG = {
    11155111:{
        name: "sepolia",
        dataFeedAddr: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    DEVELOPMENT_CHAIN,
    NETWORK_CONFIG,
    LOCKTIME,
    WAIT_CONFIRMATIONS
}