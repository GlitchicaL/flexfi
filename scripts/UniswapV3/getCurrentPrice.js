/**
 * Example script of calculating Uniswap V3 prices.
 * See: https://blog.uniswap.org/uniswap-v3-math-primer
 */

const Big = require('big.js');
const { getContracts, getTokenDecimalDifference } = require("./_helper");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const FEE = 500;

async function main() {
  const { tokens, pool } = await getContracts(WETH, USDC, FEE);

  // Get sqrtPriceX96...
  const [sqrtPriceX96] = await pool.slot0();

  // Get Both Token Decimals...
  const conversion = await getTokenDecimalDifference(tokens[0], tokens[1]);
  const rate = (Big(sqrtPriceX96).div(2 ** 96)).pow(2);

  const price = Big(rate).div(Big(conversion)).toString();
  const priceInverted = Big(1).div(price).toString();

  console.log(`\nPrice of WETH/USDC\n`)

  console.table({
    "Price": price,
    "Inverted Price": priceInverted
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
