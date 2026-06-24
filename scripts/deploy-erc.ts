import { network } from "hardhat";

const { ethers } = await network.create();

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SampleERC20 with:", deployer.address);

  const factory = await ethers.getContractFactory("SampleERC20", deployer);
  const token = await factory.deploy(deployer.address);
  await token.waitForDeployment();

  console.log("SampleERC20:", await token.getAddress());
}

await main();
