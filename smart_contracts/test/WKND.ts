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

    it("Should allow owner to call claim function", async function () {
      const { wknd, otherAccount } = await loadFixture(deployOneYearLockFixture);
      await wknd.claimToken(otherAccount.address);

      expect(await wknd.balanceOf(otherAccount.address)).to.equal(1);
    });

    it("Should fail to be called more then once for same address", async function () {
      const { wknd, otherAccount } = await loadFixture(deployOneYearLockFixture);
      await wknd.claimToken(otherAccount.address);

      await expect(wknd.claimToken(otherAccount.address)).to.be.revertedWith(
        "Already minted token for this wallet address"
      );
    });
  });
});
