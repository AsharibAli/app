import { expect } from "chai";
import { ethers } from "hardhat";
import { AssignmentSubmission } from "../typechain-types";

describe("AssignmentSubmission", function () {
  it("Should allow submission and verification", async function () {
    // Deploy the contract
    const AssignmentSubmissionFactory = await ethers.getContractFactory("AssignmentSubmission");
    const assignmentSubmission = await AssignmentSubmissionFactory.deploy() as AssignmentSubmission;
    await assignmentSubmission.waitForDeployment();

    // Submit an assignment
    const assignmentHash = ethers.keccak256(ethers.toUtf8Bytes("Test assignment"));
    await assignmentSubmission.submitAssignment(assignmentHash);

    // Check submission count
    expect(await assignmentSubmission.getSubmissionsCount()).to.equal(1n);

    // Verify the submission
    await assignmentSubmission.verifySubmission(0);

    // Check if the submission is verified
    const [, , , verified] = await assignmentSubmission.getSubmission(0);
    expect(verified).to.be.true;
  });
});