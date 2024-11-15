// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Crowdfunder {
    address public owner;
    uint256 public amountRaised;
    uint256 public totalNumberContributors;
    uint256 public maxAmountToRaise;

    struct Contributor {
        address contributorAddress;
        uint256 amount;
    }

    Contributor[] public Contributors;

    mapping(address => uint256) public contributions;

    event ContributionReceived(address indexed contributor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(uint256 _maxAmountToRaise) {
        owner = msg.sender;
        maxAmountToRaise = _maxAmountToRaise;
        amountRaised = 0;
        totalNumberContributors = 0;
    }

    function contribute() public payable {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(amountRaised < maxAmountToRaise, "Campaign has reached its maximum amount to raise");
        (bool success, ) = address(this).call{ value: msg.value }("");
		require(success);
        if (contributions[msg.sender] == 0) {
            Contributor memory contributor = Contributor({contributorAddress: msg.sender, amount: msg.value});
            Contributors.push(contributor);
            totalNumberContributors++;
        } else {
            for (uint256 i = 0; i < Contributors.length; i++) {
                if (Contributors[i].contributorAddress == msg.sender) {
                    Contributors[i].amount += msg.value;
                    break;
                }
            }
        }
        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;
        emit ContributionReceived(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner {
        require(amountRaised > 0, "No contributions yet!");
        require(address(this).balance > 0, "No funds to withdraw");
        payable(owner).transfer(address(this).balance);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getContribution(address _contributor) public view returns (uint256) {
        return contributions[_contributor];
    }

    function getContributor(uint _contributorId) public view returns(address, uint) {
        require(_contributorId < Contributors.length, "Contributor does not exist");
        Contributor memory contributor = Contributors[_contributorId];
        return(contributor.contributorAddress, contributor.amount);
    }
   

    receive() external payable {}
}