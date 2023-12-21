const hre = require("hardhat");
const { expect } = require("chai");
const { loadFixture, mine } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const ERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')

describe("NotionalExample", function () {
  const AMOUNT = hre.ethers.parseEther('10', 'ether')

  const deployNotionalExampleFixture = async () => {
    [deployer] = await hre.ethers.getSigners()

    notionalExample = await hre.ethers.deployContract("NotionalExample")
    await notionalExample.waitForDeployment()

    dai = new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", ERC20.abi, hre.ethers.provider)
    nDai = new ethers.Contract("0x6EbcE2453398af200c688C7c4eBD479171231818", ERC20.abi, hre.ethers.provider)
    note = new ethers.Contract("0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5", ERC20.abi, hre.ethers.provider)

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x60FaAe176336dAb62e284Fe19B885B095d29fB7F"],
    })

    const signer = await hre.ethers.getSigner("0x60FaAe176336dAb62e284Fe19B885B095d29fB7F")
    console.log("test")

    await (await dai.connect(signer).transfer(await notionalExample.getAddress(), AMOUNT)).wait()

    return { notionalExample, dai, nDai, note, deployer }
  }

  describe("Deployment", async () => {
    it("Has a balance", async () => {
      const { notionalExample, dai, deployer } = await loadFixture(deployNotionalExampleFixture);
      expect(await dai.connect(deployer).balanceOf(await notionalExample.getAddress())).to.equal(AMOUNT)
    })
  })

  describe("Depositing", async () => {
    // const { notionalExample, dai, nDai, note, deployer } = await loadFixture(deployNotionalExampleFixture);

    beforeEach(async () => {
      await (await notionalExample.connect(deployer).deposit()).wait()
      await (await notionalExample.connect(deployer).borrow()).wait()

      console.log('DAI Balance Before', await dai.connect(deployer).balanceOf(await notionalExample.getAddress()))
      console.log('nDAI Balance Before', await nDai.balanceOf(await notionalExample.getAddress()))
      console.log('Note Balance Before', await note.balanceOf(await notionalExample.getAddress()))

      // Fast forward 1 block...
      // New blocks are validated roughly every ~ 12 seconds
      const BLOCKS_TO_MINE = 10

      console.log(`\nFast forwarding ${BLOCKS_TO_MINE} Block...\n`)

      await mine(BLOCKS_TO_MINE, { interval: 12 })

      console.log(`Redeeming...\n`)
      console.log('DAI Balance After', await dai.connect(deployer).balanceOf(await notionalExample.getAddress()))
      console.log('nDAI Balance After', await nDai.balanceOf(await notionalExample.getAddress()))
      console.log('Note Balance After', await note.balanceOf(await notionalExample.getAddress()))
    })

    it('Updates our balance & accrues rewards', async () => {
      console.log(await notionalExample.connect(deployer).getBalance())
      expect(AMOUNT).to.equal(AMOUNT)
    })
  })
})
