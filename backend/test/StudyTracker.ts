import { expect } from "chai";
import { ethers } from "hardhat";
import { StudyTracker } from "../typechain-types";

describe("StudyTracker contract", function () {
  let studyTracker: StudyTracker;

  beforeEach(async function () {
    const StudyTracker = await ethers.getContractFactory("StudyTracker");
    studyTracker = await StudyTracker.deploy();
    await studyTracker.waitForDeployment();
  });

  it("should initially return zero study time", async function () {
    const initialTime = await studyTracker.getTotalStudyTime();
    expect(initialTime).to.equal(0);
  });

  it("should record a study session and update total time", async function () {
    const duration = 60; // 60 minutes
    await studyTracker.recordStudySession(duration);

    const totalTime = await studyTracker.getTotalStudyTime();
    expect(totalTime).to.equal(duration);
  });

  it("should accumulate study time across multiple sessions", async function () {
    const durations = [30, 45, 60]; // Three study sessions
    let expectedTotal = 0;

    for (const duration of durations) {
      await studyTracker.recordStudySession(duration);
      expectedTotal += duration;
    }

    const totalTime = await studyTracker.getTotalStudyTime();
    expect(totalTime).to.equal(expectedTotal);
  });

  it("should handle different users separately", async function () {
    const [owner, otherUser] = await ethers.getSigners();
    
    await studyTracker.connect(owner).recordStudySession(60);
    await studyTracker.connect(otherUser).recordStudySession(90);

    const ownerTime = await studyTracker.connect(owner).getTotalStudyTime();
    const otherUserTime = await studyTracker.connect(otherUser).getTotalStudyTime();

    expect(ownerTime).to.equal(60);
    expect(otherUserTime).to.equal(90);
  });
});