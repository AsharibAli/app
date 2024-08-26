// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClassPoll {
    struct Poll {
        string question;
        string[] options;
        uint256[] votes;
    }

    Poll public currentPoll;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function createPoll(string memory _question, string[] memory _options) public onlyOwner {
        require(_options.length > 1, "A poll must have at least two options");
        currentPoll.question = _question;
        currentPoll.options = _options;
        currentPoll.votes = new uint256[](_options.length);
    }

    function vote(uint256 _optionIndex) public {
        require(_optionIndex < currentPoll.options.length, "Invalid option index");
        currentPoll.votes[_optionIndex]++;
    }

    function getCurrentPoll() public view returns (Poll memory) {
        return currentPoll;
    }

    // New function to get vote counts
    function getVoteCounts() public view returns (uint256[] memory) {
        return currentPoll.votes;
    }
}