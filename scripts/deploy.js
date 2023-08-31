const hre = require("hardhat");

async function main() {
  const curveExample = await hre.ethers.deployContract("CurveExample");
  await curveExample.waitForDeployment();

  console.log(`CurveExample deployed to ${await curveExample.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
