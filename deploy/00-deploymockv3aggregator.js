const { DECIMAL , INITIAL_ANSWER , DEVELOPMENT_CHAIN} = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts,deployments}) => {
    if(DEVELOPMENT_CHAIN.includes(network.name)){
        const { firstAccount } = await getNamedAccounts();

        const { deploy } = deployments;
        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true,
        });
    }else {
        console.log("MockV3Aggregator is not deployed on this network");
    }

}

module.exports.tags = ["mock", "all"];