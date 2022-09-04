import { ethers, network } from "hardhat";
import axios from 'axios';

async function main() {
  const WKND = await ethers.getContractFactory('WKND');
  const wknd = await WKND.deploy();
  await wknd.deployed();
  console.log("Wakanda token succesfully deployed to: ", wknd.address);

  const ONE_MONTH = 30 * 24 * 60 * 60;
  const ONE_DAY = 24 * 60 * 60;

  const currentTimestamp = await getTimestamp();

  const startTime = currentTimestamp + ONE_DAY;
  const endTime = startTime + ONE_MONTH;

  const WakandaBallot = await ethers.getContractFactory("WakandaBallot");
  const wakandaBallot = await WakandaBallot.deploy(startTime, endTime, wknd.address);
  console.log("WakandaBallot contract succesfully deployed to: ", wakandaBallot.address);

  const listOfCandidates = await getCandidates();

  for (const candidate of listOfCandidates) {
    await insertCandidate(candidate.name, candidate.cult, candidate.age, wakandaBallot);
  }

  //only when you deploy on local network
  // await increaseTime(ONE_DAY);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function getCandidates(url: string = 'https://wakanda-task.3327.io/list') {
  const listOfCandidates = (await axios.get(url)).data;
  return listOfCandidates.candidates;
}

async function insertCandidate(name: string, cult: string, age: string, wakandaBallot: any) {
  await wakandaBallot.addCandidate(name, cult, age);
}

async function increaseTime(timeInSeconds: number) {
  await ethers.provider.send('evm_increaseTime', [timeInSeconds]);
  await network.provider.send("evm_mine");
}

async function getTimestamp() {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  return blockBefore.timestamp;
}

