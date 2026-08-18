import hre from "hardhat";
import { expect } from "chai";

describe("UniswapV4Example", function () {
  let connection, loadFixture;

  before(async () => {
    connection = await hre.network.create("mainnetFork");
    loadFixture = connection.networkHelpers.loadFixture.bind(connection.networkHelpers);
  });

  async function deployUniswapV4ExampleFixture() {
    const [owner] = await connection.ethers.getSigners();

    const UniswapV4Example = await connection.ethers.getContractFactory("UniswapV4Example");
    const uniswapV4Example = await UniswapV4Example.deploy();

    return { uniswapV4Example, owner };
  }

  describe("Deployment", function () {
    it("Should set the right router address", async function () {
      const { uniswapV4Example } = await loadFixture(deployUniswapV4ExampleFixture);

      const UNISWAP_UNIVERSAL_ROUTER = "0x66a9893cC07D91D95644AEDD05D03f95e1dBA8Af";

      expect(await uniswapV4Example.router()).to.equal(UNISWAP_UNIVERSAL_ROUTER);
    });
  });

  describe("Swapping", function () {
    it("Should swap WETH for USDC", async function () {
      const { uniswapV4Example, owner } = await loadFixture(deployUniswapV4ExampleFixture);

      const amountIn = connection.ethers.parseUnits("1", 18);

      await (await uniswapV4Example.connect(owner).approveTokenWithPermit2("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", amountIn)).wait();

      await (await uniswapV4Example.connect(owner).getWETH({ value: amountIn })).wait();
      expect(await uniswapV4Example.getBalance("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", uniswapV4Example.target)).to.equal(amountIn)

      const key = {
        currency0: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        currency1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        fee: 500,
        tickSpacing: 10,
        hooks: "0x0000000000000000000000000000000000000000"
      };
      const amountOut = 0;

      const transaction = await uniswapV4Example.connect(owner).executeTrade(key, amountIn, amountOut);
      await transaction.wait();

      expect(await uniswapV4Example.getBalance("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", uniswapV4Example.target)).to.be.greaterThan(0)
    });
  });
});
