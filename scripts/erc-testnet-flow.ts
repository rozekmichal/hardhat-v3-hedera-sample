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

  const factory = await ethers.getContractFactory("SampleERC20", deployer);
  const token = await factory.deploy(deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const deploymentReceipt = await token.deploymentTransaction()?.wait();

  data.contractAddress = tokenAddress;
  data.deployment = {
    hash: deploymentReceipt?.hash,
    blockNumber: deploymentReceipt?.blockNumber,
    status: deploymentReceipt?.status,
    gasUsed: deploymentReceipt?.gasUsed,
  };
  data.name = await token.name();
  data.symbol = await token.symbol();
  data.decimals = await token.decimals();
  data.totalSupply = await token.totalSupply();
  data.deployerBalanceAfterDeploy = await token.balanceOf(deployer.address);

  const transferTx = await token.transfer(deployer.address, 1n);
  const transferReceipt = await transferTx.wait();

  data.selfTransfer = {
    hash: transferReceipt?.hash,
    blockNumber: transferReceipt?.blockNumber,
    status: transferReceipt?.status,
    gasUsed: transferReceipt?.gasUsed,
  };
  data.deployerBalanceAfterSelfTransfer = await token.balanceOf(deployer.address);
  data.deployerHbarBalanceAfter = await provider.getBalance(deployer.address);

  await writeEvidence({
    ok: true,
    flow: "erc-testnet-flow",
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
    flow: "erc-testnet-flow",
    startedAt,
    finishedAt: new Date().toISOString(),
    error: normalizeError(error),
  });
  process.exitCode = 1;
}
