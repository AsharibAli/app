import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
  console.log(
    "Deploying contracts with the account:",
    (await hre.ethers.getSigners())[0].address
  );

  // Get the contract to deploy
  const StudyGroup = await hre.ethers.getContractFactory("StudyGroup");

  const studyGroup = await StudyGroup.deploy();

  await studyGroup.waitForDeployment();

  console.log("StudyGroup deployed to:", studyGroup.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })