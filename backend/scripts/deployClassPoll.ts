import "@nomicfoundation/hardhat-ethers";
import hre from "hardhat";

async function main() {
  console.log(
    "Deploying contracts with the account:",
    (await hre.ethers.getSigners())[0].address
  );

  // We get the contract to deploy
  const ClassPoll = await hre.ethers.getContractFactory("ClassPoll");

  const classPoll = await ClassPoll.deploy();

  await classPoll.waitForDeployment();

  console.log("ClassPoll deployed to:", await classPoll.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });