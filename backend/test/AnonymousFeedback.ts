import { expect } from "chai";
import { ethers } from "hardhat";
import { AnonymousFeedback } from "../typechain-types";

describe("AnonymousFeedback contract", function () {
  let anonymousFeedback: AnonymousFeedback;

  beforeEach(async function () {
    const AnonymousFeedbackFactory = await ethers.getContractFactory("AnonymousFeedback");
    anonymousFeedback = await AnonymousFeedbackFactory.deploy() as AnonymousFeedback;
    await anonymousFeedback.deploymentTransaction()!.wait();
  });

  it("should allow submitting feedback", async function () {
    const feedback = "This is a test feedback";
    await anonymousFeedback.submitFeedback(feedback);

    const feedbackCount = await anonymousFeedback.getFeedbackCount();
    expect(feedbackCount).to.equal(1);

    const retrievedFeedback = await anonymousFeedback.getFeedbackByIndex(0);
    expect(retrievedFeedback).to.equal(feedback);
  });

  it("should not allow empty feedback", async function () {
    await expect(anonymousFeedback.submitFeedback(""))
      .to.be.revertedWith("Feedback cannot be empty");
  });

  it("should return all feedback", async function () {
    const feedbacks = ["Feedback 1", "Feedback 2", "Feedback 3"];
    for (const feedback of feedbacks) {
      await anonymousFeedback.submitFeedback(feedback);
    }

    const allFeedback = await anonymousFeedback.getAllFeedback();
    expect(allFeedback).to.deep.equal(feedbacks);
  });
});