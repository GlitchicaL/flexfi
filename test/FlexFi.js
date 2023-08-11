const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, mine } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

describe("FlexFi", () => {
  const deployFlexFiFixture = async () => {
    const [deployer] = await ethers.getSigners();

    const FlexFi = await ethers.getContractFactory("FlexFi");
    const flexFi = await FlexFi.deploy();

    return { flexFi, deployer };
  }

  describe("Deployment", () => {
    it("Should set the owner", async () => {
      const { flexFi, deployer } = await loadFixture(deployFlexFiFixture);
      expect(await flexFi.owner()).to.equal(deployer.address);
    });
  });
});
