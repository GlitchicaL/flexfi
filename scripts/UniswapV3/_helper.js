const hre = require("hardhat");

const Big = require('big.js');

const IUniswapV3Factory = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

const UniswapV3Factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

class Token {
  constructor(contract, address, symbol, decimals) {
    this.contract = contract;
    this.address = address;
    this.symbol = symbol;
    this.decimals = decimals;
  }
}

async function getContracts(token0Address, token1Address, fee) {
  const uniswapV3Factory = new ethers.Contract(UniswapV3Factory, IUniswapV3Factory.abi, hre.ethers.provider);
  const token0Contract = new ethers.Contract(token0Address, ERC20.abi, hre.ethers.provider)
  const token1Contract = new ethers.Contract(token1Address, ERC20.abi, hre.ethers.provider)

  const token0 = new Token(
    token0Contract,
    token0Address,
    await token0Contract.symbol(),
    await token0Contract.decimals()
  );

  const token1 = new Token(
    token1Contract,
    token1Address,
    await token1Contract.symbol(),
    await token1Contract.decimals()
  );

  // Get Address...
  const poolAddress = await uniswapV3Factory.getPool(token0Address, token1Address, fee);

  // Create Pool Contract...
  const pool = new ethers.Contract(poolAddress, IUniswapV3Pool.abi, hre.ethers.provider);

  return { tokens: [token0, token1], pool };
}

async function getTokenDecimalDifference(token0, token1) {
  const decimalDifference = Number(Big(token0.decimals - token1.decimals).abs());
  return Big(10).pow(decimalDifference);
}

module.exports = {
  getContracts,
  getTokenDecimalDifference
}