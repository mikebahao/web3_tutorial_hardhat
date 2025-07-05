const { task } = require("hardhat/config");

task("interact-fundme","Interact with the FundMe contract")
    .addParam("contractaddr", "The address of the FundMe contract")
    .setAction(async(taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(taskArgs.contractaddr);

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

});


module.exports = {}