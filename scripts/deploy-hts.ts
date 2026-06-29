import { network } from "hardhat";

const { ethers } = await network.create();
const HTS_MANAGER_DEPLOY_GAS_LIMIT = 2_000_000n;

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying HtsTokenManager with:", deployer.address);

  const factory = await ethers.getContractFactory("HtsTokenManager", deployer);
  const manager = await factory.deploy(ethers.ZeroAddress, {
    gasLimit: HTS_MANAGER_DEPLOY_GAS_LIMIT,
  });
  await manager.waitForDeployment();

  console.log("HtsTokenManager:", await manager.getAddress());
  console.log("Call createSampleToken() on Hedera localnet/testnet to exercise 0x167.");
}

await main();
