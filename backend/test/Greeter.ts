import {expect } from "chai"
import {ethers} from "hardhat"

describe("Greeter contract", function () {
  it("should be deployed and return the initial greeting", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy();

    // Test the initial greeting
    const initialGreeting = await greeter.read();
    expect(initialGreeting).to.equal("Hello, world!");
  });

  it("should update the greeting", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy();

    // Update the greeting
    const newGreeting = "Hello, Open Campus!";
    await greeter.write(newGreeting);

    // Test the updated greeting
    const updatedGreeting = await greeter.read();
    expect(updatedGreeting).to.equal(newGreeting);
  });
});
