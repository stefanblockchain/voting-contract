import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WKND token", function () {
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const WKND = await ethers.getContractFactory("WKND");
    const wknd = await WKND.deploy();

    return { wknd, owner, otherAccount, thirdAccount };
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

      it("Snapshot should be equl to current balance", async function () {
        const { wknd, otherAccount } = await loadFixture(deployOneYearLockFixture);
      
       await wknd.connect(otherAccount).mintToken();
       await wknd.snapshot();

       const snapshotId = await wknd.getCurrentSnapshotId();
       const balance = await wknd.balanceOfAt(otherAccount.address, snapshotId);

       expect(snapshotId).to.equal(1);
       expect(balance).to.equal(1);

      });

      it("Snapshot should fail to be same as current balance", async function () {
        const { wknd, otherAccount, thirdAccount } = await loadFixture(deployOneYearLockFixture);
      
       await wknd.connect(otherAccount).mintToken();
       await wknd.connect(thirdAccount).mintToken();
       await wknd.snapshot();

       await wknd.connect(otherAccount).transfer(thirdAccount.address, 1);
        
       const snapshotId = await wknd.getCurrentSnapshotId();
       const snapshotBalance = await wknd.balanceOfAt(otherAccount.address, snapshotId);
       const balance = await wknd.balanceOf(thirdAccount.address);

       expect(balance).to.equal(2);
       expect(snapshotBalance).to.equal(1);

      });
  });
});
