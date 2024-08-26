import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
  console.log(
    "Deploying contracts with the account:",
    (await hre.ethers.getSigners())[0].address
  );

  // Get the contract to deploy
  const AnonymousFeedback = await hre.ethers.getContractFactory("AnonymousFeedback");

  const anonymousFeedback = await AnonymousFeedback.deploy();

  await anonymousFeedback.waitForDeployment();

  console.log("AnonymousFeedback deployed to:", anonymousFeedback.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });