const hre = require("hardhat");

async function main() {
  const flexFi = await hre.ethers.deployContract("FlexFi");
  await flexFi.waitForDeployment();

  console.log(`FlexFi deployed to ${await flexFi.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
