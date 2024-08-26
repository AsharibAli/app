import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
  console.log(
    "Deploying contracts with the account:",
    (await hre.ethers.getSigners())[0].address
  );

  // Get the contract to deploy
  const AssignmentSubmission = await hre.ethers.getContractFactory("AssignmentSubmission");

  const assignmentSubmission = await AssignmentSubmission.deploy();

  await assignmentSubmission.waitForDeployment();

  console.log("AssignmentSubmission deployed to:", assignmentSubmission.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });