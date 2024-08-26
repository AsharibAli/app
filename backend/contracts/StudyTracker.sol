// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudyTracker {
    mapping(address => uint256) public studyTimes;

    function recordStudySession(uint256 duration) public {
        studyTimes[msg.sender] += duration;
    }

    function getTotalStudyTime() public view returns (uint256) {
        return studyTimes[msg.sender];
    }
}