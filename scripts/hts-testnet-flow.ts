import { network } from "hardhat";
import { normalizeError, writeEvidence } from "./lib/evidence.js";

const startedAt = new Date().toISOString();

async function main(): Promise<void> {
  const connection = await network.create();
  const { ethers } = connection;
  const [deployer] = await ethers.getSigners();
  const provider = ethers.provider;
  const networkInfo = await provider.getNetwork();

  const data: Record<string, unknown> = {
    deployer: deployer.address,
    deployerBalanceBefore: await provider.getBalance(deployer.address),
  };

  const factory = await ethers.getContractFactory("HtsTokenManager", deployer);
  const manager = await factory.deploy(deployer.address);
  await manager.waitForDeployment();

  const managerAddress = await manager.getAddress();
  const deploymentReceipt = await manager.deploymentTransaction()?.wait();

  data.managerAddress = managerAddress;
  data.deployment = {
    hash: deploymentReceipt?.hash,
    blockNumber: deploymentReceipt?.blockNumber,
    status: deploymentReceipt?.status,
    gasUsed: deploymentReceipt?.gasUsed,
  };

  const createTx = await manager.createSampleToken();
  const createReceipt = await createTx.wait();
  const tokenAddress = await manager.token();

  data.createSampleToken = {
    hash: createReceipt?.hash,
    blockNumber: createReceipt?.blockNumber,
    status: createReceipt?.status,
    gasUsed: createReceipt?.gasUsed,
    tokenAddress,
  };

  const mintTx = await manager.mint(100);
  const mintReceipt = await mintTx.wait();

  data.mint = {
    hash: mintReceipt?.hash,
    blockNumber: mintReceipt?.blockNumber,
    status: mintReceipt?.status,
    gasUsed: mintReceipt?.gasUsed,
  };
  data.deployerHbarBalanceAfter = await provider.getBalance(deployer.address);

  await writeEvidence({
    ok: true,
    flow: "hts-testnet-flow",
    networkName: connection.networkName,
    chainId: networkInfo.chainId.toString(),
    startedAt,
    finishedAt: new Date().toISOString(),
    data,
  });
}

try {
  await main();
} catch (error) {
  await writeEvidence({
    ok: false,
    flow: "hts-testnet-flow",
    startedAt,
    finishedAt: new Date().toISOString(),
    error: normalizeError(error),
  });
  process.exitCode = 1;
}
