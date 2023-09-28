const hre = require("hardhat");

/**
 * Example script of calculating Uniswap V3 prices.
 * See: https://blog.uniswap.org/uniswap-v3-math-primer
 */

const Big = require('big.js');

const IUniswapV3Factory = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

const UniswapV3Factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const FEE = 500

async function main() {
  const uniswapV3Factory = new ethers.Contract(UniswapV3Factory, IUniswapV3Factory.abi, hre.ethers.provider);
  const weth = new ethers.Contract(WETH, ERC20.abi, hre.ethers.provider);
  const usdc = new ethers.Contract(USDC, ERC20.abi, hre.ethers.provider);

  // Get Address...
  const poolAddress = await uniswapV3Factory.getPool(WETH, USDC, FEE)

  // Create Pool Contract...
  const pool = new ethers.Contract(poolAddress, IUniswapV3Pool.abi, hre.ethers.provider);

  // Get sqrtPriceX96...
  const [sqrtPriceX96] = await pool.slot0()

  // Get Both Token Decimals...
  const token0Decimals = await weth.decimals() // <-- 18
  const token1Decimals = await usdc.decimals() // <-- 6
  const decimalDifference = Number(Big(token0Decimals - token1Decimals).abs()) // <-- 12
  const conversion = Big(10).pow(decimalDifference) // <-- 10 ^ 12

  const rate = (Big(sqrtPriceX96).div(Big(2 ** 96))) ** Big(2)

  const price = Big(rate).div(Big(conversion)).toString()
  const priceInverted = Big(1).div(price).toString()

  console.log(`\nPrice of WETH/USDC\n`)

  console.table({
    "Price": price,
    "Inverted Price": priceInverted
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
