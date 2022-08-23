import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WKND token", function () {
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const WKND = await ethers.getContractFactory("WKND");
    const wknd = await WKND.deploy();

    return { wknd, owner, otherAccount };
  }

  describe("Mint", function () {
    it("Should allow user to mint one token ", async function () {
      const { wknd, otherAccount } = await loadFixture(deployOneYearLockFixture);
    
     const previusBalance = await wknd.balanceOf(otherAccount.address);
     await wknd.connect(otherAccount).mintToken();
     const currentBalance = await wknd.balanceOf(otherAccount.address);
    expect(previusBalance).to.equal(0);
    expect(currentBalance).to.equal(1);
    });

    it("Should fail to allow user to mint more then once", async function () {
        const { wknd, otherAccount } = await loadFixture(deployOneYearLockFixture);
      
       await wknd.connect(otherAccount).mintToken();
       await expect(wknd.connect(otherAccount).mintToken()).to.be.revertedWith(
        "Already minted token for this wallet address"
      );
      });
  });
});
