// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract CampaignFactory {
    Campaign[] public campaigns;
    
    function createCampaign(uint minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        campaigns.push(newCampaign);
    }
    
    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }
}


contract Campaign {
    struct Request {
        address payable recipient;
        string description;
        uint value;
        uint approvalCount;
        bool complete;
        mapping(address => bool) approvals;
    }
    
    address public manager;
    
    uint public minimumContribution;
    uint public approversCount;
    uint public requestsCount;
    uint requestIndex = 0;
    
    mapping(address => bool) public approvers;
    mapping(uint => Request) public requests;
    
    modifier restricted {
        require(msg.sender == manager, "manager privileges only");
        _;
    }
    
    constructor(uint minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }
    
    function contribute() public payable {
        require(msg.value > minimumContribution, "minimum contribution required");
        
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string memory description, uint value, address payable recipient) public restricted {
        require(value <= address(this).balance);
        Request storage r = requests[requestIndex];
        
        r.description = description;
        r.recipient = recipient;
        r.value = value;
        r.complete = false;
        r.approvalCount = 0;
        
        requestIndex++;
        requestsCount++;
    }
    
    function approveRequest(uint index) public {
        Request storage r = requests[index];
        
        require(approvers[msg.sender]);
        require(!r.approvals[msg.sender]);
        
        r.approvals[msg.sender] = true;
        r.approvalCount++;
    }
    
    function finalizeRequest(uint index) public restricted {
        Request storage r = requests[index];
        
        require(r.approvalCount > (approversCount / 2));
        require(!r.complete);
        
        r.recipient.transfer(r.value);
        r.complete = true;
    }

    function getCampaignDetails() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            address(this).balance,
            requestsCount,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requestsCount;
    }
}