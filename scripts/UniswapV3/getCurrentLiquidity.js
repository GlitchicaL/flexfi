const { ethers } = require("hardhat");
const Big = require('big.js');
const { getContracts } = require("./_helper");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const FEE = 3000;

function getLiquidityInTickRange({ tick, lowerTick, upperTick, sqrtPriceX96, lowerSqrtPrice, upperSqrtPrice, liquidity }) {
  const Q96 = 2 ** 96;
  const currentSqrtPrice = Big(sqrtPriceX96).div(Q96);

  // Formula
  // TOKEN0 AMOUNT = liquidity * (upperSqrtPrice - currentSqrtPrice) / (sqrtPrice * upperSqrtPrice)
  // TOKEN1 AMOUNT = liquidity * (currentSqrtPrice - lowerSqrtPrice)

  if (tick < lowerTick) {
    console.log(`Current tick ${tick} is less than ${lowerTick}`);
    console.log("Fetching liquidity for token0...");

    const amount0 = getToken0Liquidity({ liquidity, currentSqrtPrice, upperSqrtPrice });
    return { amount0, amount1: 0 }
  }

  if (tick >= upperTick) {
    console.log(`Current tick ${tick} is greater than ${upperTick}`);
    console.log("Fetching liquidity for token1...");

    const amount1 = getToken1Liquidity({ liquidity, currentSqrtPrice, lowerSqrtPrice });
    return { amount0: 0, amount1 }
  }

  if (tick >= lowerTick && tick < upperTick) {
    console.log(`Current tick ${tick} is greater than ${lowerTick} & less than ${upperTick}`);
    console.log("Fetching liquidity for token0 & token1...");

    amount0 = getToken0Liquidity({ liquidity, currentSqrtPrice, upperSqrtPrice });
    amount1 = getToken1Liquidity({ liquidity, currentSqrtPrice, lowerSqrtPrice });

    return { amount0, amount1 }
  }

  return { amount: 0, amount1: 0 }
}

function getToken0Liquidity({ liquidity, currentSqrtPrice, upperSqrtPrice }) {
  const sqrtPriceDifference = upperSqrtPrice.sub(currentSqrtPrice);

  const amount = Math.floor(Number(Big(liquidity)
    .mul(sqrtPriceDifference)
    .div(currentSqrtPrice.mul(upperSqrtPrice))));

  return amount;
}

function getToken1Liquidity({ liquidity, currentSqrtPrice, lowerSqrtPrice }) {
  const sqrtPriceDifference = currentSqrtPrice.sub(lowerSqrtPrice);

  const amount = Math.floor(Number(Big(liquidity)
    .mul(sqrtPriceDifference)));

  return amount;
}

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

  // Calculate upper and lower sqrtPrice
  // sqrt(1.0001 ^ tick)
  const lowerSqrtPrice = Big(1.0001 ** Number(lowerTick)).sqrt();
  const upperSqrtPrice = Big(1.0001 ** Number(upperTick)).sqrt();

  // Get current liquidity in active tick range. Ex
  // 10 tick spacing, with current tick of 10055. 
  // This will return the liquidity between ticks 10050 to 10060
  const { amount0, amount1 } = getLiquidityInTickRange({
    tick,
    lowerTick,
    upperTick,
    sqrtPriceX96,
    lowerSqrtPrice,
    upperSqrtPrice,
    liquidity
  });

  console.table({
    "token0 Liquidity": ethers.formatUnits(amount0.toString(), 6),
    "token1 Liquidity": ethers.formatUnits(amount1.toString(), 18),
  });
}

main();