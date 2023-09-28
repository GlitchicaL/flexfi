const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

describe("UniswapV3Example", () => {
  const deployUniswapV3ExampleFixture = async () => {
    const [deployer] = await ethers.getSigners();

    const UniswapV3Example = await ethers.getContractFactory("UniswapV3Example");
    const uniswapV3Example = await UniswapV3Example.deploy();

    const weth = new ethers.Contract(WETH, ERC20.abi, hre.ethers.provider);
    const usdt = new ethers.Contract(USDT, ERC20.abi, hre.ethers.provider);
    const dai = new ethers.Contract(DAI, ERC20.abi, hre.ethers.provider);
    const usdc = new ethers.Contract(USDC, ERC20.abi, hre.ethers.provider);

    return { uniswapV3Example, weth, usdc, usdt, dai, deployer };
  };

  describe("Deployment", () => {
    it("Should set the owner", async () => {
      const { uniswapV3Example, deployer } = await loadFixture(deployUniswapV3ExampleFixture);
      expect(await uniswapV3Example.owner()).to.equal(deployer.address);
    });
  });

  describe("Getting WETH", () => {
    it("Successfully Deposits ETH for WETH", async () => {
      const { uniswapV3Example, weth, deployer } = await loadFixture(deployUniswapV3ExampleFixture);

      const AMOUNT = hre.ethers.parseUnits('1', 18);

      await (await uniswapV3Example.connect(deployer).getWETH({ value: AMOUNT })).wait();
      expect(await weth.balanceOf(await uniswapV3Example.getAddress())).to.equal(AMOUNT);
    });
  });

  describe("Swapping", () => {
    it("Successfully Swaps", async () => {
      const { uniswapV3Example, usdc, deployer } = await loadFixture(deployUniswapV3ExampleFixture);

      // Prepare Swap...
      const PATH = [WETH, USDC];
      const AMOUNT = ethers.parseUnits('0.5', 18);
      const FEE = 500;

      // The FEE variable will usually be 100 (0.01%), 500 (0.05%), or 3000 (0.3%)

      // Get WETH & SWAP...
      await (await uniswapV3Example.connect(deployer).getWETH({ value: AMOUNT })).wait();
      await (await uniswapV3Example.connect(deployer).swap(PATH, FEE, AMOUNT)).wait();

      expect(await usdc.balanceOf(await uniswapV3Example.getAddress())).to.be.greaterThan(0);
    });
  })

  describe("Adding Liquidity", () => {
    it("Successfully Acquires LP Tokens", async () => {
      // TODO
    });
  });
});
