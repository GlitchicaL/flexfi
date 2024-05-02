const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

describe("AaveExample", function () {
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const AAVE_POOL_ADDRESS = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
  const AAVE_WETH_ADDRESS = "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8";

  async function deployAaveExample() {
    const [owner] = await ethers.getSigners();

    const weth = await ethers.getContractAt(ERC20.abi, WETH_ADDRESS);
    const usdc = await ethers.getContractAt(ERC20.abi, USDC_ADDRESS);

    const AaveExample = await ethers.getContractFactory("AaveExample");
    const aaveExample = await AaveExample.deploy();

    const WETH_HOLDER = "0x8EB8a3b98659Cce290402893d0123abb75E3ab28";
    const USDC_HOLDER = "0xD6153F5af5679a75cC85D8974463545181f48772";

    await (await owner.sendTransaction({ to: WETH_HOLDER, value: ethers.parseUnits('5', 18) })).wait();
    await (await owner.sendTransaction({ to: USDC_HOLDER, value: ethers.parseUnits('5', 18) })).wait();

    await (
      await weth.connect(
        await ethers.getImpersonatedSigner(WETH_HOLDER)).transfer(owner.address, ethers.parseUnits('100', 18)))
      .wait();

    await (
      await usdc.connect(
        await ethers.getImpersonatedSigner(USDC_HOLDER)).transfer(owner.address, ethers.parseUnits('100', 6)))
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

      const AMOUNT = ethers.parseUnits("1", 18);

      // Transfer WETH
      await (await weth.connect(owner).transfer(await aaveExample.getAddress(), AMOUNT)).wait();

      // Supply WETH
      await (await aaveExample.connect(owner).supplyAave(AMOUNT)).wait();
      expect(await aaveExample.getTokenBalance(AAVE_WETH_ADDRESS)).to.be.greaterThan(0);
    });
  });

  describe("Borrowing", function () {
    it("Should supply WETH and borrow USDC", async function () {
      const { weth, aaveExample, owner } = await loadFixture(deployAaveExample);

      const DEPOSIT_AMOUNT = ethers.parseUnits("1", 18);
      const BORROW_AMOUNT = ethers.parseUnits("5", 6);

      // Transfer WETH
      await (await weth.connect(owner).transfer(await aaveExample.getAddress(), DEPOSIT_AMOUNT)).wait();

      // Supply WETH
      await (await aaveExample.connect(owner).supplyAave(DEPOSIT_AMOUNT)).wait();
      expect(await aaveExample.getTokenBalance(WETH_ADDRESS)).to.be.equal(0);
      expect(await aaveExample.getTokenBalance(AAVE_WETH_ADDRESS)).to.be.equal(DEPOSIT_AMOUNT);

      // Borrow USDC
      await (await aaveExample.connect(owner).borrowAave(BORROW_AMOUNT)).wait();
      expect(await aaveExample.getTokenBalance(USDC_ADDRESS)).to.be.equal(BORROW_AMOUNT);
    });
  });
});