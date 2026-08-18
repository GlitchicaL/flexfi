import hre from "hardhat";

async function main() {
  const curveExample = await hre.ethers.deployContract("CurveExample");
  await curveExample.waitForDeployment();

  console.log(`CurveExample deployed to ${await curveExample.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
