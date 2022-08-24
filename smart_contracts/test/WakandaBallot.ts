import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import axios from 'axios';
import { expect } from "chai";
import { ethers, network } from "hardhat";

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

   for(const candidate of listOfCandidates){
    await insertCandidate(candidate.name, candidate.cult, candidate.age, wakandaBallot);
   }
    
    await wknd.connect(otherAccount).mintToken();
    await wknd.connect(thirdAccount).mintToken();

    return { wakandaBallot,wknd, startTime, endTime, listOfCandidates, owner, otherAccount, thirdAccount };
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

  describe('Voting', function(){
    it('Should fail to vote before start time', async function () {
      const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
      const firstCandidate = await wakandaBallot.candidates(ethers.BigNumber.from("0"));
      const userBalance = await wknd.balanceOf(otherAccount.address);
      
      await expect(wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, userBalance)).to.be.revertedWith('Voting is not in correct state');
    });

    it('Should fail to add existing candidate', async function () {
      const { wakandaBallot, listOfCandidates } = await loadFixture(deployOneYearLockFixture);
      const firstCandidate = listOfCandidates[0];
      
      await expect(wakandaBallot.addCandidate(firstCandidate.name, firstCandidate.cult, firstCandidate.age)).to.be.revertedWith('Candidate already added');
    });

    it('Should fail to add  candidate if not owner of the contract', async function () {
      const { wakandaBallot, otherAccount, listOfCandidates } = await loadFixture(deployOneYearLockFixture);
      const firstCandidate = listOfCandidates[0];
      
      await expect(wakandaBallot.connect(otherAccount).addCandidate(firstCandidate.name, firstCandidate.cult, firstCandidate.age)).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should get correct vote state', async function () {
      const { wakandaBallot, startTime } = await loadFixture(deployOneYearLockFixture);
      const ONE_DAY = 24 * 60 * 60;
      const THREE_DAYS = 3 * 24 * 60 * 60;

      let result = await wakandaBallot.getElectionState();
      expect(await wakandaBallot.getElectionState()).to.equal(VotingStates.NOT_STARTED);

      await increaseTime(ONE_DAY);
      result = await wakandaBallot.getElectionState();
      expect(await wakandaBallot.getElectionState()).to.equal(VotingStates.STARTED);

      await increaseTime(THREE_DAYS);
      result = await wakandaBallot.getElectionState();
      expect(await wakandaBallot.getElectionState()).to.equal(VotingStates.FINISHED);
      
  });

    it('Should vote successfully', async function () {
      const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
      const ONE_DAY = 24 * 60 * 60;

      const candidateId = ethers.BigNumber.from("0");
      const firstCandidate = await wakandaBallot.candidates(candidateId);
      const userBalance = await wknd.balanceOf(otherAccount.address);
      await wknd.connect(otherAccount).approve(wakandaBallot.address, userBalance);
      await increaseTime(ONE_DAY);
      await wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, userBalance);

      const result = await wakandaBallot.candidates(candidateId);

      expect(result.count).to.equal(ethers.BigNumber.from('1'));
  });

  it('Should prevent multiple voting', async function () {
    const { wakandaBallot, otherAccount, thirdAccount, wknd } = await loadFixture(deployOneYearLockFixture);
    const ONE_DAY = 24 * 60 * 60;

    const candidateId = ethers.BigNumber.from("0");
    const firstCandidate = await wakandaBallot.candidates(candidateId);
    const userBalance = await wknd.balanceOf(otherAccount.address);
    await wknd.connect(otherAccount).approve(wakandaBallot.address, userBalance);

    await increaseTime(ONE_DAY);
    await wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, userBalance);
    
    const thirdAccountAmount = await wknd.balanceOf(thirdAccount.address);
    await wknd.connect(thirdAccount).transfer(otherAccount.address, thirdAccountAmount);

    await expect(wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, thirdAccountAmount)).to.be.revertedWith('Already voted');    
});

it('Should reduce wknd user balance for number of casted votes', async function () {
  const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
  const ONE_DAY = 24 * 60 * 60;

  const firstCandidate = await wakandaBallot.candidates(ethers.BigNumber.from("0"));
  let balance = await wknd.balanceOf(otherAccount.address);
  await wknd.connect(otherAccount).approve(wakandaBallot.address, balance);

  await increaseTime(ONE_DAY);
  await wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, balance);
  
  balance = await wknd.balanceOf(otherAccount.address);

  expect(await wknd.balanceOf(otherAccount.address)).to.equal(ethers.BigNumber.from('0'));    
});

it('Should return correct winners', async function () {
  const { wakandaBallot, otherAccount, thirdAccount, wknd } = await loadFixture(deployOneYearLockFixture);
  const ONE_DAY = 24 * 60 * 60;

  const firstCandidateId = ethers.BigNumber.from("0");
  const secondCandidateId = ethers.BigNumber.from("1");
  const firstCandidate = await wakandaBallot.candidates(firstCandidateId);
  const secondCandidate = await wakandaBallot.candidates(secondCandidateId);

  const firstUserBalance = await wknd.balanceOf(otherAccount.address);
  const secondUserBalance = await wknd.balanceOf(thirdAccount.address);
  await wknd.connect(otherAccount).approve(wakandaBallot.address, firstUserBalance);
  await wknd.connect(thirdAccount).approve(wakandaBallot.address, secondUserBalance);

  await increaseTime(ONE_DAY);

  await wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, firstUserBalance);
  await wakandaBallot.connect(thirdAccount).vote(secondCandidate.hash, secondUserBalance);

  //get winners list
  const winners = await wakandaBallot.winningCandidates();
  const firstWinner = winners[0];
  const secondWinner = winners[1]; 

  expect(winners.length).to.equal(2);

  compareCandidates(firstCandidate, firstWinner);
  expect(firstWinner.count).to.equal(firstUserBalance);

  compareCandidates(secondCandidate, secondWinner);
  expect(secondWinner.count).to.equal(secondUserBalance);
});

it('Should emit Voted event', async function () {
  const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
  const ONE_DAY = 24 * 60 * 60;

  const firstCandidate = await wakandaBallot.candidates(ethers.BigNumber.from("0"));
  const balance = await wknd.balanceOf(otherAccount.address);
  
  await wknd.connect(otherAccount).approve(wakandaBallot.address, balance);

  await increaseTime(ONE_DAY);

  await expect(wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, balance))
              .to.emit(wakandaBallot, 'Voted')
              .withArgs(otherAccount.address, balance, firstCandidate.name, firstCandidate.cult);

});
});

describe('Unstaking', function(){
  it('Should fail to unstake before end of voting time', async function () {
    const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
    const ONE_DAY = 24 * 60 * 60;
  
    const firstCandidate = await wakandaBallot.candidates(ethers.BigNumber.from("0"));
    let balance = await wknd.balanceOf(otherAccount.address);
    await wknd.connect(otherAccount).approve(wakandaBallot.address, balance);
  
    await increaseTime(ONE_DAY);
    await wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, balance);
    
    balance = await wknd.balanceOf(otherAccount.address);
  
    await expect(wakandaBallot.connect(otherAccount).unstake()).to.be.revertedWith('Voting is not in correct state');   
  });

  it('Should fail to unstake if user didn\'t vote', async function () {
    const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
    const FOUR_DAY = 4 * 24 * 60 * 60;
        
    await increaseTime(FOUR_DAY);

    await expect(wakandaBallot.connect(otherAccount).unstake()).to.be.revertedWith('Voter didnt stake any tokens');   
  });

  it('Should unstake successfully', async function () {
    const { wakandaBallot, otherAccount, wknd } = await loadFixture(deployOneYearLockFixture);
    const ONE_DAY =  24 * 60 * 60;
    const FOUR_DAY = 4 * ONE_DAY;

    const prevBalance = await wknd.balanceOf(otherAccount.address);
    await wknd.connect(otherAccount).approve(wakandaBallot.address, prevBalance);
    await increaseTime(ONE_DAY);

    const firstCandidate = await wakandaBallot.candidates(ethers.BigNumber.from("0"));
    await wakandaBallot.connect(otherAccount).vote(firstCandidate.hash, prevBalance);
    
    await increaseTime(FOUR_DAY);

    await wakandaBallot.connect(otherAccount).unstake();
  
    const currentBalance = await wknd.balanceOf(otherAccount.address);

    expect(prevBalance).to.equal(currentBalance)
  });
});
});


interface CanidateResponse {
  candidates: [
    name: string,
    age: number,
    cult: string
  ]
}

async function getCandidates(url:string = 'https://wakanda-task.3327.io/list'){
  const listOfCandidates = (await axios.get(url)).data;
  return listOfCandidates.candidates;
}

async function insertCandidate(name:string, cult:string, age:string, wakandaBallot:any){
  await wakandaBallot.addCandidate(name, cult, age);
}


async function increaseTime(timeInSeconds: number){
  await ethers.provider.send('evm_increaseTime', [timeInSeconds]);
  await network.provider.send("evm_mine");
}

function compareCandidates(firstCandidate: any, secondCandidate: any){
  expect(firstCandidate.name).to.equal(secondCandidate.name);
  expect(firstCandidate.cult).to.equal(secondCandidate.cult);
  expect(firstCandidate.age).to.equal(secondCandidate.age);
}

enum VotingStates {
  NOT_STARTED = 0,
  STARTED = 1,
  FINISHED = 2
}