import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import axios from 'axios';
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WakandaBallot", function () {
  async function deployOneYearLockFixture() {
    const THREE_DAYS = 3 * 24 * 60 * 60;
    const ONE_DAY = 24 * 60 * 60;
    const startTime = await time.latest() + ONE_DAY;
    const endTime = startTime + THREE_DAYS;

    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const WKND = await ethers.getContractFactory("WKND");
    const wknd = await WKND.deploy();

    const WakandaBallot = await ethers.getContractFactory("WakandaBallot");
    const wakandaBallot = await WakandaBallot.deploy(startTime, endTime, wknd.address);

    const listOfCandidates = await getCandidates();
    // listOfCandidates.candidates.forEach(async (candidate) => insertCandidate(candidate.name, candidate.cult, candidate.age, wakandaBallot))
    

    //mint tokens for addresses
    await wknd.connect(otherAccount).mintToken();

    return { wakandaBallot,wknd, startTime, endTime, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should set the right startTime and endTime", async function () {
      const { wakandaBallot, startTime, endTime } = await loadFixture(deployOneYearLockFixture);

      expect(await wakandaBallot.startTime()).to.equal(startTime);
      expect(await wakandaBallot.endTime()).to.equal(endTime);
    });

    it("Should set the right owner", async function () {
      const { wakandaBallot, owner } = await loadFixture(deployOneYearLockFixture);

      expect(await wakandaBallot.owner()).to.equal(owner.address);
    });

    it("Should set the right token address", async function () {
        const { wakandaBallot, wknd } = await loadFixture(deployOneYearLockFixture);
  
        expect(await wakandaBallot.wknd()).to.equal(wknd.address);
      });
  });

  // describe("Voting", function () {
  //   it("Should fail to vote", async function () {
  //     const { wakandaBallot, startTime, endTime, otherAccount } = await loadFixture(deployOneYearLockFixture);
      
  //   });
  // });
});


interface CanidateResponse {
  candidates: [
    name: string,
    age: number,
    cult: string
  ]
}

async function getCandidates(url:string = 'https://wakanda-task.3327.io/list'){
  const listOfCandidates: CanidateResponse = (await axios.get(url)).data;
  return listOfCandidates;
}

async function insertCandidate(name:string, cult:string, age:string, wakandaBallot:any){
  await wakandaBallot.addCandidate(name, cult, age);
}
