// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudyGroup {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    Message[] public messages;
    mapping(address => bool) public members;

    event MessageSent(address indexed sender, string content, uint256 timestamp);
    event MemberJoined(address indexed member);

    function joinGroup() public {
        require(!members[msg.sender], "Already a member");
        members[msg.sender] = true;
        emit MemberJoined(msg.sender);
    }

    function sendMessage(string memory _content) public {
        require(members[msg.sender], "Must be a member to send messages");
        require(bytes(_content).length > 0, "Message cannot be empty");
        require(bytes(_content).length <= 280, "Message too long");

        messages.push(Message(msg.sender, _content, block.timestamp));
        emit MessageSent(msg.sender, _content, block.timestamp);
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }

    function getMemberStatus(address _address) public view returns (bool) {
        return members[_address];
    }
}