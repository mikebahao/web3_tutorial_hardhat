const { assert , expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { DEVELOPMENT_CHAIN } = require("../../helper-hardhat-config");

!DEVELOPMENT_CHAIN.includes(network.name) ? 
describe.skip
: describe("test fundme smart contract with developmentchain", async function() {

    let fundMe;
    let mockV3Aggregator;
    let firstAccount;

    beforeEach(async function() {
        // This will run before each test in this block.
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        const fundMeDeployment = await deployments.get("FundMe");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");

        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);

    });


    it("test if the contract owner is msg.sender", async function() {

        // wait for the deployment to finish.
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.owner(), firstAccount, "The contract owner is not the first account");

    });

    it("test if the dataFeed is assigned correctly", async function() {
      
        // wait for the deployment to finish.
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.dataFeed(), mockV3Aggregator.address, "The fundMe dataFeed is not assigned correctly!");

    });

    // unit test for the fund function:window open,value is greater than MINIMUM_USD,check funder balance.
    it("test fund function:window is closed,fund transaction failed", async function() {
        await helpers.time.increase(200); // Increase time by 300 seconds to test the lock time.
        await helpers.mine(); // Mine a block to apply the time increase.
        await expect(fundMe.fund({value: ethers.parseEther("0.002")}))
            .to.be.revertedWith("Fund window is closed!"); // Fund the contract with 0.002 ETH.
    });

    it("test fund function:window is open,value is less,fund transaction failed", async function() {
        await expect(fundMe.fund({value: ethers.parseEther("0.0001")}))
            .to.be.revertedWith("You cannot fund less than minimum amount"); // Fund the contract with 0.0001 ETH.
    });

    it("test fund function:window is open,value is greater,fund transaction success", async function() {
        await fundMe.fund({value: ethers.parseEther("0.002")});
        const funderBalance = await fundMe.fundersToAmount(firstAccount);
        await assert.equal(funderBalance.toString(), ethers.parseEther("0.002").toString(), "Funder balance is not correct after funding");
    });
    

    it("test getFund function:only owner,window is open,getfund failed", async function() {
        await fundMe.fund({value: ethers.parseEther("0.01")});

        await expect(fundMe.getFund())
            .to.be.revertedWith("Fund window is not close!"); // Get funds from the contract.
    });

    it("test getFund function:only owner,window is closed,target reached,getfund success", async function() {
        await fundMe.fund({value: ethers.parseEther("0.01")});

        await helpers.time.increase(200); // Increase time by 300 seconds to test the lock time.
        await helpers.mine(); // Mine a block to apply the time increase.

        await expect(fundMe.getFund())
            .to.emit(fundMe, "getFundByOwner")
            .withArgs(ethers.parseEther("0.01"));

    });
})