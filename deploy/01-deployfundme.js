const { network } = require("hardhat");
const { DEVELOPMENT_CHAIN , NETWORK_CONFIG , LOCKTIME , WAIT_CONFIRMATIONS} = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts,deployments}) => {
    const { firstAccount } = await getNamedAccounts();

    const { deploy } = deployments;

    let dataFeedAddr;

    let wait_confirmations;

    if(DEVELOPMENT_CHAIN.includes(network.name)){
        const dataFeedDeployment = await deployments.get("MockV3Aggregator");
        dataFeedAddr = dataFeedDeployment.address;
        wait_confirmations = 0;

    }else{
        dataFeedAddr = NETWORK_CONFIG[network.config.chainId].dataFeedAddr;
        wait_confirmations = WAIT_CONFIRMATIONS;
    }

    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCKTIME, dataFeedAddr],
        log: true,
        waitConfirmations: wait_confirmations
    });

    // remove deployments directory or add deploy command with --reset flag if you want to redeploy contract.

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){

        // verify the contract on Etherscan sepolia.
        await hre.run("verify:verify", {
        address: fundMe.address,
        constructorArguments: [LOCKTIME, dataFeedAddr]});

    }else {
        console.log("Skipping verification on Etherscan sepolia, as the chainId is not 11155111 or ETHERSCAN_API_KEY is not set.");
    }


}

module.exports.tags = ["FundMe", "all"];