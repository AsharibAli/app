import { expect } from "chai";
import { ethers } from "hardhat";
import { ClassPoll } from "../typechain-types";

describe("ClassPoll", function () {
  let classPoll: ClassPoll;

  beforeEach(async function () {
    const ClassPoll = await ethers.getContractFactory("ClassPoll");
    classPoll = await ClassPoll.deploy() as ClassPoll;
    await classPoll.waitForDeployment();
  });

  it("should create a poll and allow voting", async function () {
    const [owner, voter] = await ethers.getSigners();

    // Create a poll
    await classPoll.connect(owner).createPoll("Favorite color?", ["Red", "Blue", "Green"]);

    // Vote
    await classPoll.connect(voter).vote(1); // Vote for Blue

    // Check results
    const voteCounts = await classPoll.getVoteCounts();
    expect(voteCounts[1]).to.equal(1);

    // Get current poll
    const currentPoll = await classPoll.getCurrentPoll();
    expect(currentPoll.question).to.equal("Favorite color?");
    expect(currentPoll.options).to.deep.equal(["Red", "Blue", "Green"]);
  });
});