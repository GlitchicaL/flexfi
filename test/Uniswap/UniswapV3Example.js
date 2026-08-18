import hre from "hardhat";
import { expect } from "chai";

import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json' with { type: 'json' };

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

describe("UniswapV3Example", () => {
  let connection, loadFixture;

  before(async () => {
    connection = await hre.network.create("mainnetFork");
    loadFixture = connection.networkHelpers.loadFixture.bind(connection.networkHelpers);
  });

  const deployUniswapV3ExampleFixture = async () => {
    const [deployer] = await connection.ethers.getSigners();

    const UniswapV3Example = await connection.ethers.getContractFactory("UniswapV3Example");
    const uniswapV3Example = await UniswapV3Example.deploy();

    const weth = new connection.ethers.Contract(WETH, ERC20.abi, connection.ethers.provider);
    const usdt = new connection.ethers.Contract(USDT, ERC20.abi, connection.ethers.provider);
    const dai = new connection.ethers.Contract(DAI, ERC20.abi, connection.ethers.provider);
    const usdc = new connection.ethers.Contract(USDC, ERC20.abi, connection.ethers.provider);

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

      const AMOUNT = connection.ethers.parseUnits('1', 18);

      await (await uniswapV3Example.connect(deployer).getWETH({ value: AMOUNT })).wait();
      expect(await weth.balanceOf(await uniswapV3Example.getAddress())).to.equal(AMOUNT);
    });
  });

  describe("Swapping", () => {
    it("Successfully Swaps", async () => {
      const { uniswapV3Example, usdc, deployer } = await loadFixture(deployUniswapV3ExampleFixture);

      const PATH = [WETH, USDC];
      const AMOUNT = connection.ethers.parseUnits('0.5', 18);
      const FEE = 500;

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
