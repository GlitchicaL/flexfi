import hre from "hardhat";
import { expect } from "chai";

import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json' with { type: 'json' };

describe("AaveExample", function () {
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const AAVE_POOL_ADDRESS = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
  const AAVE_WETH_ADDRESS = "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8";

  let connection, loadFixture;

  before(async () => {
    connection = await hre.network.create("mainnetFork");
    loadFixture = connection.networkHelpers.loadFixture.bind(connection.networkHelpers);
  });

  async function deployAaveExample() {
    const [owner] = await connection.ethers.getSigners();

    const weth = await connection.ethers.getContractAt(ERC20.abi, WETH_ADDRESS);
    const usdc = await connection.ethers.getContractAt(ERC20.abi, USDC_ADDRESS);

    const AaveExample = await connection.ethers.getContractFactory("AaveExample");
    const aaveExample = await AaveExample.deploy();

    const WETH_HOLDER = "0x8EB8a3b98659Cce290402893d0123abb75E3ab28";
    const USDC_HOLDER = "0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341";

    await (await owner.sendTransaction({ to: WETH_HOLDER, value: connection.ethers.parseUnits('5', 18) })).wait();
    await (await owner.sendTransaction({ to: USDC_HOLDER, value: connection.ethers.parseUnits('5', 18) })).wait();

    await (
      await weth.connect(
        await connection.ethers.getImpersonatedSigner(WETH_HOLDER)).transfer(owner.address, connection.ethers.parseUnits('100', 18)))
      .wait();

    await (
      await usdc.connect(
        await connection.ethers.getImpersonatedSigner(USDC_HOLDER)).transfer(owner.address, connection.ethers.parseUnits('100', 6)))
      .wait();

    return { weth, usdc, aaveExample, owner };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { aaveExample, owner } = await loadFixture(deployAaveExample);
      expect(await aaveExample.owner()).to.equal(owner.address);
    });

    it("Should set the Pool address", async function () {
      const { aaveExample } = await loadFixture(deployAaveExample);
      expect(await aaveExample.AAVE_POOL_ADDRESS()).to.equal(AAVE_POOL_ADDRESS);
    });

    it("Should set the USDC address", async function () {
      const { aaveExample } = await loadFixture(deployAaveExample);
      expect(await aaveExample.USDC_ADDRESS()).to.equal(USDC_ADDRESS);
    });

    it("Should set the WETH address", async function () {
      const { aaveExample } = await loadFixture(deployAaveExample);
      expect(await aaveExample.WETH_ADDRESS()).to.equal(WETH_ADDRESS);
    });
  });

  describe("Supplying", function () {
    it("Should supply WETH", async function () {
      const { weth, aaveExample, owner } = await loadFixture(deployAaveExample);

      const AMOUNT = connection.ethers.parseUnits("1", 18);

      await (await weth.connect(owner).transfer(await aaveExample.getAddress(), AMOUNT)).wait();
      await (await aaveExample.connect(owner).supplyAave(AMOUNT)).wait();
      expect(await aaveExample.getTokenBalance(AAVE_WETH_ADDRESS)).to.be.greaterThan(0);
    });
  });

  describe("Borrowing", function () {
    it("Should supply WETH and borrow USDC", async function () {
      const { weth, aaveExample, owner } = await loadFixture(deployAaveExample);

      const DEPOSIT_AMOUNT = connection.ethers.parseUnits("1", 18);
      const BORROW_AMOUNT = connection.ethers.parseUnits("5", 6);

      await (await weth.connect(owner).transfer(await aaveExample.getAddress(), DEPOSIT_AMOUNT)).wait();
      await (await aaveExample.connect(owner).supplyAave(DEPOSIT_AMOUNT)).wait();
      expect(await aaveExample.getTokenBalance(WETH_ADDRESS)).to.be.equal(0);
      expect(await aaveExample.getTokenBalance(AAVE_WETH_ADDRESS)).to.be.equal(DEPOSIT_AMOUNT);

      await (await aaveExample.connect(owner).borrowAave(BORROW_AMOUNT)).wait();
      expect(await aaveExample.getTokenBalance(USDC_ADDRESS)).to.be.equal(BORROW_AMOUNT);
    });
  });
});
