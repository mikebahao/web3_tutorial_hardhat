const { assert , expect } = require("chai");
const { ethers, deployments, network } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { DEVELOPMENT_CHAIN } = require("../../helper-hardhat-config");

DEVELOPMENT_CHAIN.includes(network.name) ? describe.skip : 

describe("test fundme smart contract with sepoliachain", async function() {

    let fundMe;
    let firstAccount;

    beforeEach(async function() {
        // This will run before each test in this block.
        await deployments.fixture(["all"]);
        firstAccount = (await getNamedAccounts()).firstAccount;

        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);

    });

    // test fund and getFund successfully
    it("test fund and getFund successfully", async function() {
        // make sure target reached
        await fundMe.fund({value: ethers.parseEther("0.01")});
        // make sure window is closed
        await new Promise(resolve => setTimeout(resolve, 200 * 1000)); 

        // make sure we can get the receipt
        const getFundTx = await fundMe.getFund();
        const getFundReceipt = await getFundTx.wait();

        expect(getFundReceipt)
            .to.emit(fundMe, "getFundByOwner")
            .withArgs(ethers.parseEther("0.01"));
        
    });
    
    // test fund and reFund successfully
    it("test fund and reFund successfully", async function() {
        // make sure target not reached
        await fundMe.fund({value: ethers.parseEther("0.002")});
        // make sure window is closed
        await new Promise(resolve => setTimeout(resolve, 200 * 1000)); 

        // make sure we can reFund
        const reFundTx = await fundMe.reFund();
        const reFundReceipt = await reFundTx.wait();

        expect(reFundReceipt)
            .to.emit(fundMe, "reFundByFunder")
            .withArgs(firstAccount, ethers.parseEther("0.002"));
    });


})