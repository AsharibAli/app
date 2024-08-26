// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AnonymousFeedback {
    // Array to store all feedback submissions
    string[] private feedbackList;

    // Event to emit when new feedback is submitted
    event FeedbackSubmitted(uint256 indexed feedbackId);

    // Function to submit new feedback
    function submitFeedback(string memory _feedback) public {
        require(bytes(_feedback).length > 0, "Feedback cannot be empty");
        feedbackList.push(_feedback);
        emit FeedbackSubmitted(feedbackList.length - 1);
    }

    // Function to get the total number of feedback submissions
    function getFeedbackCount() public view returns (uint256) {
        return feedbackList.length;
    }

    // Function to get a specific feedback by index
    function getFeedbackByIndex(uint256 _index) public view returns (string memory) {
        require(_index < feedbackList.length, "Index out of bounds");
        return feedbackList[_index];
    }

    // Function to get all feedback (only callable by educators)
    function getAllFeedback() public view returns (string[] memory) {
        return feedbackList;
    }
}