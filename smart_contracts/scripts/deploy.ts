import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import axios from 'axios';

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  const WKND = await ethers.getContractFactory('WKND');
  const wknd = await WKND.deploy();
  await wknd.deployed();
  console.log("Wakanda token succesfully deployed to: ", wknd.address);

  await wknd.connect(owner).mintToken();
  await wknd.connect(otherAccount).mintToken();

  await wknd.snapshot();

  const ONE_MONTH = 30 * 24 * 60 * 60;
  const ONE_MINUTE = 60;
  const startTime = await time.latest() + ONE_MINUTE;
  const endTime = startTime + ONE_MONTH;

  const WakandaBallot = await ethers.getContractFactory("WakandaBallot");
  const wakandaBallot = await WakandaBallot.deploy(startTime, endTime, wknd.address);
  console.log("WakandaBallot contract succesfully deployed to: ", wakandaBallot.address);

  const listOfCandidates = await getCandidates();

   for(const candidate of listOfCandidates){
    await insertCandidate(candidate.name, candidate.cult, candidate.age, wakandaBallot);
   }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function getCandidates(url:string = 'https://wakanda-task.3327.io/list'){
  const listOfCandidates = (await axios.get(url)).data;
  return listOfCandidates.candidates;
}

async function insertCandidate(name:string, cult:string, age:string, wakandaBallot:any){
  await wakandaBallot.addCandidate(name, cult, age);
}

