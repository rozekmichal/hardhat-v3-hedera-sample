import { network } from "hardhat";

const { ethers } = await network.create();

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying HtsTokenManager with:", deployer.address);

  const factory = await ethers.getContractFactory("HtsTokenManager", deployer);
  const manager = await factory.deploy(deployer.address);
  await manager.waitForDeployment();

  console.log("HtsTokenManager:", await manager.getAddress());
  console.log("Call createSampleToken() on Hedera localnet/testnet to exercise 0x167.");
}

await main();
