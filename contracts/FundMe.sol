// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1.Create a fund function.
// 2.Record funders and retrive investment funds.
// 3.During the lock-up period,achieve the target value,the producer can withdraw funds.-- getFund
// 4.If the target value is not reached,investors can request a refund -- reFund.

/* Coin(native Token):
  1.A coin is a digital currency similar to the physical currency.
  2.Coin operates on its own blockchain with its own protocol.
  3.Coins are purely used as a source of payments.
  4.For e.g. Ripple and Etheruem.
*/

/* Token:
  1.A token is a digital asset issued on a particular project.
  2.Token does not operate on their own blockchain.
  3.Tokens are used for payments and signing digital agreements.
  4.For e.g. BON and DAO token.
*/

contract FundMe {

    mapping(address => uint256) public fundersToAmount;

    // Oracle problem:Smart contract are unable to connect external system,data feed,APIs.
    // Existing payment systems or any other off-chain resources on their own.
    // consensus:Submit transaction,Broadcast transaction,Reach consensus.
    // Decentralized Oracle Network(DON):Full replicas being run by independent and sybil-resistent node operators.
    // Data delivery layer mimic the trust-minimized that blockchain has.
    uint256 constant MINIMUM_VALUE = 5*10**18;

    uint256 constant TARGET_VALUE = 25*10**18; 

    address public owner;

    uint256 deploymentTimestamp;

    uint256 locktime;

    address erc20Addr;

    bool public getFundSuccess = false;
    
    AggregatorV3Interface internal dataFeed;

    constructor(uint256 _locktime){
        owner = msg.sender;
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        deploymentTimestamp = block.timestamp;
        locktime = _locktime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "You cannot fund less than minimum amount");
        require(block.timestamp < deploymentTimestamp+locktime,"Fund window is closed!");
        fundersToAmount[msg.sender] = msg.value;

    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns (uint256){
        uint256 ethPrice =  uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10**8);

    }

    function getFund() external  windowClosed onlyOwner {
        require(convertEthToUsd(address(this).balance) >= TARGET_VALUE,"target is not reached!");
        // transfer:Transfer ETH and revert if tx is failed.payable(msg.sender).transfer(address(this).balance).
        // send:transfer ETH and return false if tx failed.payable(msg.sender).send(address(this).balance).
        // call:transfer ETH with data return value of function and bool.
        bool success;
        (success,) = payable(msg.sender).call{value:address(this).balance}("");
        require(success,"Getfund transaction is failed!");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true; // flag
    }

    function reFund() external windowClosed {
        require(convertEthToUsd(address(this).balance) < TARGET_VALUE,"target is reached!");
        require(fundersToAmount[msg.sender] != 0,"You have not fund to refund");
        bool success;
        (success,) = payable(msg.sender).call{value:fundersToAmount[msg.sender]}("");
        require(success,"Refund transaction is failed!");
        fundersToAmount[msg.sender] = 0;

    }

    function setFunderToAmout(address _funder,uint256 _amountToUpdate) external {
        require(msg.sender == erc20Addr,"You don't permission to call this function!");
        fundersToAmount[_funder] = _amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    function transferOwnership(address newOwer) public onlyOwner {
        owner = newOwer;
    }

    modifier windowClosed(){
        require(block.timestamp >= deploymentTimestamp+locktime,"Fund window is not close!");
        _;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Only Owner can do this");
        _;
    }

}