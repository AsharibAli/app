import { expect } from "chai";
import { ethers } from "hardhat";
import { StudyGroup } from "../typechain-types";

describe("StudyGroup", function () {
  let studyGroup: StudyGroup;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const StudyGroupFactory = await ethers.getContractFactory("StudyGroup");
    studyGroup = await StudyGroupFactory.deploy();
  });

  it("should allow a user to join and send a message", async function () {
    // Join the group
    await studyGroup.connect(addr1).joinGroup();
    expect(await studyGroup.getMemberStatus(addr1.address)).to.be.true;

    // Send a message
    const message = "Hello, study group!";
    await studyGroup.connect(addr1).sendMessage(message);

    // Check if the message was stored
    const messages = await studyGroup.getMessages();
    expect(messages.length).to.equal(1);
    expect(messages[0].sender).to.equal(addr1.address);
    expect(messages[0].content).to.equal(message);
  });
});