import hre from "hardhat";
import { expect } from "chai";

import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json' with { type: 'json' };
import Booster from '../../abis/Convex/Booster.json' with { type: 'json' };
import BaseRewardPool from '../../abis/Convex/BaseRewardPool.json' with { type: 'json' };

describe("ConvexExample", function () {
  let amount;
  let deployer, user1;
  let convexExample, booster, rewardPool, lpToken, token;
  let connection, loadFixture, mine;

  before(async () => {
    connection = await hre.network.create("mainnetFork");
    loadFixture = connection.networkHelpers.loadFixture.bind(connection.networkHelpers);
    mine = connection.networkHelpers.mine.bind(connection.networkHelpers);
  });

  async function deployConvexExample() {
    amount = connection.ethers.parseEther('10', 'ether');

    [deployer, user1] = await connection.ethers.getSigners();

    convexExample = await connection.ethers.deployContract("ConvexExample");
    await convexExample.waitForDeployment();

    lpToken = new connection.ethers.Contract("0x971add32Ea87f10bD192671630be3BE8A11b8623", ERC20.abi, connection.ethers.provider);
    token = new connection.ethers.Contract("0x0148CF564318272c2Bad048488F90dF4e3769f32", ERC20.abi, connection.ethers.provider);
    booster = new connection.ethers.Contract("0xF403C135812408BFbE8713b5A23a04b3D48AAE31", Booster, connection.ethers.provider);
    rewardPool = new connection.ethers.Contract("0x39D78f11b246ea4A1f68573c3A5B64E83Cff2cAe", BaseRewardPool, connection.ethers.provider);

    const IMPERSONATED_SIGNER = "0x34CdfEB92F7dd096ebB8c618875B8ecA8Fd50d83";

    await deployer.sendTransaction({
      to: IMPERSONATED_SIGNER,
      value: connection.ethers.parseUnits('10', 'ether')
    });

    await (await lpToken.connect(
      await connection.ethers.getImpersonatedSigner(IMPERSONATED_SIGNER)
    ).transfer(await convexExample.getAddress(), amount)).wait();

    return { convexExample, lpToken, token, booster, rewardPool, deployer, user1 };
  }

  describe("Deployment", async () => {
    it("Has a balance", async () => {
      const { convexExample, lpToken, deployer } = await loadFixture(deployConvexExample);
      expect(await lpToken.connect(deployer).balanceOf(await convexExample.getAddress())).to.equal(amount);
    });
  });

  describe("Depositing", async () => {
    it('Updates our balance & accrues rewards', async () => {
      const { convexExample, rewardPool } = await loadFixture(deployConvexExample);

      await (await convexExample.connect(deployer).depositCRV(amount)).wait();

      const BLOCKS_TO_MINE = 1;

      console.log(`\nFast forwarding ${BLOCKS_TO_MINE} Block...\n`);

      await mine(BLOCKS_TO_MINE, {
        interval: 12
      });

      console.log(await rewardPool.earned(await convexExample.getAddress()));
      expect(await rewardPool.balanceOf(await convexExample.getAddress())).to.equal(amount);
      expect(await rewardPool.earned(await convexExample.getAddress())).to.be.greaterThan(0);
    });
  });
});
