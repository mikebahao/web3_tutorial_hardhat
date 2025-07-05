const { task } = require("hardhat/config");

task("deploy-fundme","Deploy fundme with task!").setAction(async(taskArgs, hre) => {
// create a contract factory for the FundMe contract.
  const fundMeFactory = await ethers.getContractFactory("FundMe");

  // deploy the contract from fundMeFactory.
  const fundMe = await fundMeFactory.deploy(300);
  console.log("Deploying fundMe contract...");

  // wait for the deployment to finish.
  await fundMe.waitForDeployment();
  console.log(`FundMe contract deployed at: ${fundMe.target}`);

  if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {

    // wait for 5 confirmations.
    console.log("FundMe contract is waiting for 5 confirmations...");
    await fundMe.deploymentTransaction().wait(5);
  
    // verify the contract on Etherscan sepolia.
    await verifyFundMe(fundMe.target,[300]);

  }else {
    console.log("Skipping verification on Etherscan sepolia, as the chainId is not 11155111 or ETHERSCAN_API_KEY is not set.");

  }

});

async function verifyFundMe(fundMeAddr,args) {
  // verify the contract on Etherscan sepolia.
  await hre.run("verify:verify", {
  address: fundMeAddr,
  constructorArguments: args,});

}

module.exports = {}