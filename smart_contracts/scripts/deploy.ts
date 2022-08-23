import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const WKND = await ethers.getContractFactory('WKND');
  const wknd = await WKND.deploy();
  await wknd.deployed();
  console.log("Wakanda token succesfully deployed to: ", wknd.address);

  const ONE_MONTH = 30 * 24 * 60 * 60;
  const ONE_DAY = 24 * 60 * 60;
  const startTime = await time.latest() + ONE_DAY;
  const endTime = startTime + ONE_MONTH;

  const WakandaBallot = await ethers.getContractFactory("WakandaBallot");
  const wakandaBallot = await WakandaBallot.deploy(startTime, endTime, wknd.address);
  console.log("WakandaBallot contract succesfully deployed to: ", wakandaBallot.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
