// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AssignmentSubmission {
    struct Submission {
        address student;
        string assignmentHash;
        uint256 timestamp;
        bool verified;
    }

    Submission[] public submissions;
    mapping(address => bool) public educators;

    event SubmissionAdded(address indexed student, string assignmentHash, uint256 timestamp);
    event SubmissionVerified(address indexed student, string assignmentHash, uint256 timestamp);

    constructor() {
        educators[msg.sender] = true;
    }

    modifier onlyEducator() {
        require(educators[msg.sender], "Only educators can call this function");
        _;
    }

    function addEducator(address _educator) public onlyEducator {
        educators[_educator] = true;
    }

    function submitAssignment(string memory _assignmentHash) public {
        submissions.push(Submission({
            student: msg.sender,
            assignmentHash: _assignmentHash,
            timestamp: block.timestamp,
            verified: false
        }));
        emit SubmissionAdded(msg.sender, _assignmentHash, block.timestamp);
    }

    function verifySubmission(uint256 _index) public onlyEducator {
        require(_index < submissions.length, "Invalid submission index");
        require(!submissions[_index].verified, "Submission already verified");
        
        submissions[_index].verified = true;
        emit SubmissionVerified(submissions[_index].student, submissions[_index].assignmentHash, block.timestamp);
    }

    function getSubmissionsCount() public view returns (uint256) {
        return submissions.length;
    }

    function getSubmission(uint256 _index) public view returns (address, string memory, uint256, bool) {
        require(_index < submissions.length, "Invalid submission index");
        Submission memory sub = submissions[_index];
        return (sub.student, sub.assignmentHash, sub.timestamp, sub.verified);
    }
}