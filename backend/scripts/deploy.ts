import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";


async function main() {
  console.log(
    "Deploying contracts with the account:",
    (await hre.ethers.getSigners())[0].address
  );

  // We get the contract to deploy
  const Greeter = await hre.ethers.getContractFactory("Greeter");

  const greeter = await Greeter.deploy();

  await greeter.waitForDeployment();

  console.log("Greeter deployed to:", greeter.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
