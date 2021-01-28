// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract Lottery {
    address public manager;
    address public winner;
    address[] private players;
    
    constructor() {
        manager = msg.sender;
    }
    
    modifier admin() {
        require(msg.sender == manager, "Require Admin Privileges");
        _;
    }
    
    modifier minEntry() {
        require(msg.value > .01 ether, "Require min amount of ETH(0.011) to enter");
        _;
    }
    
    function enter() public payable minEntry {
        players.push(msg.sender);
    }
    
    function pickWinner() public admin {
        uint index = random() % players.length;
        address contractAddress = address(this);
        address winnerAddress = players[index];
        winner = players[index];
        payable(winnerAddress).transfer(contractAddress.balance);
        players = new address[](0);
    }
    
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
    
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }
}