import { network } from "hardhat";

const { ethers } = await network.create();
const ERC_DEPLOY_GAS_LIMIT = 2_000_000n;

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SampleERC20 with:", deployer.address);

  const factory = await ethers.getContractFactory("SampleERC20", deployer);
  const token = await factory.deploy(deployer.address, {
    gasLimit: ERC_DEPLOY_GAS_LIMIT,
  });
  await token.waitForDeployment();

  console.log("SampleERC20:", await token.getAddress());
}

await main();
