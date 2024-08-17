const Big = require('big.js');
const { getContracts, getTokenDecimalDifference } = require("./_helper");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const FEE = 500;

async function main() {
  // Setup the pool contract
  // By default this is using WETH/USDC on Ethereum
  const { tokens, pool } = await getContracts(WETH, USDC, FEE);

  // Fetch liquidity, sqrtPrice, and tick
  const liquidity = await pool.liquidity();
  const tickSpacing = await pool.tickSpacing();
  const [sqrtPriceX96, tick] = await pool.slot0();

  console.log(`\nLiquidity: ${liquidity}`);
  console.log(`Current SqrtPriceX96: ${sqrtPriceX96}\n`);

  // If current tick divided by the tick spacing has no remainer, 
  // then just minus the current tick by the tick spacing.
  const lowerTick = tick % tickSpacing === 0n ? tick - tickSpacing : tick - (tick % tickSpacing);
  const upperTick = tick + (tickSpacing - (tick % tickSpacing));

  console.log(`Lower tick: ${lowerTick}`);
  console.log(`Current tick: ${tick}`);
  console.log(`Upper tick: ${upperTick}\n`);

  // Calculate upper and lower sqrtPriceX96
  // sqrt(1.0001 ^ tick) * 9 ^ 96
  const lowerSqrtPriceX96 = Big(1.0001 ** Number(lowerTick)).sqrt().mul(2 ** 96).toFixed(0);
  const upperSqrtPriceX96 = Big(1.0001 ** Number(upperTick)).sqrt().mul(2 ** 96).toFixed(0);

  console.log(`lowerSqrtPriceX96: ${lowerSqrtPriceX96}`);
  console.log(`upperSqrtPriceX96: ${upperSqrtPriceX96}\n`);

  const currentRate = Big(sqrtPriceX96).div(2 ** 96).pow(2);
  const lowerRate = Big(lowerSqrtPriceX96).div(2 ** 96).pow(2);
  const upperRate = Big(upperSqrtPriceX96).div(2 ** 96).pow(2);

  const conversion = await getTokenDecimalDifference(tokens[0], tokens[1]);

  const currentPrice = Big(currentRate).div(Big(conversion)).toString();
  const lowerPrice = Big(lowerRate).div(Big(conversion)).toString();
  const upperPrice = Big(upperRate).div(Big(conversion)).toString();

  console.log(`\nPrices of WETH/USDC\n`);

  console.table({
    "Lower Tick": lowerTick,
    "Lower Price": lowerPrice,
    "Inverted Lower Price": Big(1).div(lowerPrice).toString(),
  });

  console.table({
    "Current Tick": tick,
    "Current Price": currentPrice,
    "Inverted Current Price": Big(1).div(currentPrice).toString(),
  });

  console.table({
    "Upper Tick": upperTick,
    "Upper Price": upperPrice,
    "Inverted Upper Price": Big(1).div(upperPrice).toString(),
  });
}

main();