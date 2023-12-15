const hre = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');
const Booster = require('../../abis/Convex/Booster.json');
const BaseRewardPool = require('../../abis/Convex/BaseRewardPool.json');

describe("ConvexExample", function () {
  const AMOUNT = hre.ethers.parseEther('10', 'ether');

  let deployer, user1;
  let convexExample, booster, rewardPool;

  beforeEach(async () => {
    [deployer, user1] = await hre.ethers.getSigners();

    convexExample = await hre.ethers.deployContract("ConvexExample");
    await convexExample.waitForDeployment();

    lpToken = new ethers.Contract("0x971add32Ea87f10bD192671630be3BE8A11b8623", ERC20.abi, hre.ethers.provider);
    token = new ethers.Contract("0x0148CF564318272c2Bad048488F90dF4e3769f32", ERC20.abi, hre.ethers.provider);
    booster = new ethers.Contract("0xF403C135812408BFbE8713b5A23a04b3D48AAE31", Booster, hre.ethers.provider);
    rewardPool = new ethers.Contract("0x39D78f11b246ea4A1f68573c3A5B64E83Cff2cAe", BaseRewardPool, hre.ethers.provider);

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xAEAe6e812E2492E0CCE3d31da528007e3F8C7225"],
    });

    const signer = await hre.ethers.getSigner("0xAEAe6e812E2492E0CCE3d31da528007e3F8C7225");

    await deployer.sendTransaction({
      to: "0xAEAe6e812E2492E0CCE3d31da528007e3F8C7225",
      value: hre.ethers.parseUnits('10', 'ether')
    });

    await (await lpToken.connect(signer).transfer(await convexExample.getAddress(), AMOUNT)).wait();
  });

  describe("Deployment", async () => {
    it("Has a balance", async () => {
      expect(await lpToken.connect(deployer).balanceOf(await convexExample.getAddress())).to.equal(AMOUNT);
    });
  });

  describe("Depositing", async () => {
    beforeEach(async () => {
      await (await convexExample.connect(deployer).depositCRV(AMOUNT)).wait();

      // Fast forward 1 block...
      // New blocks are validated roughly every ~ 12 seconds
      const BLOCKS_TO_MINE = 1;

      console.log(`\nFast forwarding ${BLOCKS_TO_MINE} Block...\n`);

      await mine(BLOCKS_TO_MINE, {
        interval: 12
      });
    });

    it('Updates our balance & accrues rewards', async () => {
      console.log(await rewardPool.earned(await convexExample.getAddress()));
      expect(await rewardPool.balanceOf(await convexExample.getAddress())).to.equal(AMOUNT);
      expect(await rewardPool.earned(await convexExample.getAddress())).to.be.greaterThan(0);
    });
  });
});