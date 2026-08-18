import hre from "hardhat";
import { expect, assert } from "chai";

import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json' with { type: 'json' };

const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const CVX = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

describe("CurveExample", () => {
  let connection, loadFixture, ethers;

  before(async () => {
    connection = await hre.network.create("mainnetFork");
    loadFixture = connection.networkHelpers.loadFixture.bind(connection.networkHelpers);
    ethers = connection.ethers;
  });

  const deployCurveExampleFixture = async () => {
    const [deployer] = await ethers.getSigners();

    const CurveExample = await ethers.getContractFactory("CurveExample");
    const curveExample = await CurveExample.deploy();

    const weth = new ethers.Contract(WETH, ERC20.abi, connection.ethers.provider);
    const cvx = new ethers.Contract(CVX, ERC20.abi, connection.ethers.provider);
    const usdt = new ethers.Contract(USDT, ERC20.abi, connection.ethers.provider);
    const dai = new ethers.Contract(DAI, ERC20.abi, connection.ethers.provider);
    const usdc = new ethers.Contract(USDC, ERC20.abi, connection.ethers.provider);

    return { curveExample, weth, cvx, usdt, dai, usdc, deployer };
  }

  describe("Deployment", () => {
    it("Should set the owner", async () => {
      const { curveExample, deployer } = await loadFixture(deployCurveExampleFixture);
      expect(await curveExample.owner()).to.equal(deployer.address);
    });
  });

  describe("Getting WETH", () => {
    it("Successfully Deposits ETH for WETH", async () => {
      const { curveExample, weth, deployer } = await loadFixture(deployCurveExampleFixture);

      const AMOUNT = ethers.parseUnits('1', 18);

      await (await curveExample.connect(deployer).getWETH({ value: AMOUNT })).wait();
      expect(await weth.balanceOf(await curveExample.getAddress())).to.equal(AMOUNT);
    });
  });

  describe("Swapping", () => {
    it("Successfully Swaps", async () => {
      const { curveExample, usdt, deployer } = await loadFixture(deployCurveExampleFixture);

      const PATH = [ETH, USDT];
      const AMOUNT = ethers.parseUnits('0.025', 'ether');
      const POOL = await curveExample.connect(deployer).getBestPool(PATH, AMOUNT);

      if (POOL === '0x0000000000000000000000000000000000000000') {
        assert.fail(`No Pool Available: ${POOL}`);
      }

      await (await curveExample.connect(deployer).swapOnCurve(POOL, PATH, AMOUNT, 0, { value: AMOUNT })).wait();
      expect(await usdt.balanceOf(await curveExample.getAddress())).to.be.greaterThan(0);
    });
  })

  describe("Adding Liquidity", () => {
    it("Successfully Acquires LP Tokens", async () => {
      const { curveExample, weth, cvx, deployer } = await loadFixture(deployCurveExampleFixture);

      const POOL = '0xb576491f1e6e5e62f1d8f26062ee822b40b0e0d4';
      const TOKENS = [WETH, CVX];
      const AMOUNTS = [ethers.parseUnits('1', 18), ethers.parseUnits('100', 18)];
      const SWAP_AMOUNT = ethers.parseUnits('1', 18);

      await (await curveExample.connect(deployer).getWETH({ value: SWAP_AMOUNT })).wait();
      await (await curveExample.connect(deployer).swapOnCurve(POOL, [ETH, CVX], SWAP_AMOUNT, 0, { value: SWAP_AMOUNT })).wait();

      expect(await cvx.balanceOf(await curveExample.getAddress())).to.be.greaterThan(0);
      expect(await weth.balanceOf(await curveExample.getAddress())).to.equal(SWAP_AMOUNT);

      await (await curveExample.connect(deployer).addLiquidityToCurve(
        TOKENS,
        AMOUNTS,
        POOL,
        0
      )).wait();

      const LP_TOKEN = await curveExample.getLPAddress(POOL);
      const lp = new ethers.Contract(LP_TOKEN, ERC20.abi, connection.ethers.provider);
      expect(await lp.balanceOf(await curveExample.getAddress())).to.be.greaterThan(0);
    });
  });
});
