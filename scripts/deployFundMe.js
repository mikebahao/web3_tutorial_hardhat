// import ethers.js
// create main function
// execute the main function

const { ethers } = require("hardhat");

async function main() {
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

  // initialize two accounts.
  const [firstAccount, secondAccount] = await ethers.getSigners();
  console.log(`First account address: ${firstAccount.address}`);
  console.log(`Second account address: ${secondAccount.address}`);

  // call fund function from the first account.
  const fundTx = await fundMe.connect(firstAccount).fund({
    value: ethers.parseEther("0.003")});
  console.log("Funding 0.003 eth to the contract from the first account...");
  await fundTx.wait();

  // check the balance of the contract.
  const contractBalance = await ethers.provider.getBalance(fundMe.target);
  console.log(`contract balance after funding from first account: ${ethers.formatEther(contractBalance)} eth`);

  // call fund function from the second account.
  const fundTx2 = await fundMe.connect(secondAccount).fund({
    value: ethers.parseEther("0.004")});
  console.log("Funding 0.004 eth to the contract from the second account...");
  await fundTx2.wait();

  // check the balance of the contract again.
  const contractBalance2 = await ethers.provider.getBalance(fundMe.target);
  console.log(`contract balance after funding from second account: ${ethers.formatEther(contractBalance2)} eth`);

  // check mapping of the fundersToAmount.
  const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
  const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);
  console.log(`First account balance in FundMe: ${ethers.formatEther(firstAccountBalanceInFundMe)} eth`);
  console.log(`Second account balance in FundMe: ${ethers.formatEther(secondAccountBalanceInFundMe)} eth`);

}

async function verifyFundMe(fundMeAddr,args) {
  // verify the contract on Etherscan sepolia.
  await hre.run("verify:verify", {
  address: fundMeAddr,
  constructorArguments: args,});

}

// execute the main function and handle errors.
main().then().catch((error) => {
    console.error(error);
    process.exit(0);
});