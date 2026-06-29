import { network } from "hardhat";
import { normalizeError, writeEvidence } from "./lib/evidence.js";

const startedAt = new Date().toISOString();
const HTS_MANAGER_DEPLOY_GAS_LIMIT = 2_000_000n;
const DEFAULT_HTS_CREATE_TOKEN_GAS_LIMIT = 15_000_000n;
const DEFAULT_HTS_CREATE_TOKEN_GAS_PRICE_WEIBAR = 10_000_000_000_000n;
const HTS_MINT_GAS_LIMIT = 1_000_000n;
const DEFAULT_HTS_CREATE_TOKEN_VALUE_HBAR = "50";
const DEFAULT_HTS_MANAGER_FUNDING_HBAR = "0";

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
  const createTokenGasLimit = BigInt(
    process.env.HEDERA_HTS_CREATE_TOKEN_GAS_LIMIT ??
      DEFAULT_HTS_CREATE_TOKEN_GAS_LIMIT.toString(),
  );
  const createTokenGasPrice = BigInt(
    process.env.HEDERA_HTS_CREATE_TOKEN_GAS_PRICE_WEIBAR ??
      DEFAULT_HTS_CREATE_TOKEN_GAS_PRICE_WEIBAR.toString(),
  );
  const managerFunding = ethers.parseEther(
    process.env.HEDERA_HTS_MANAGER_FUNDING_HBAR ?? DEFAULT_HTS_MANAGER_FUNDING_HBAR,
  );
  const createTokenValue = ethers.parseEther(
    process.env.HEDERA_HTS_CREATE_TOKEN_VALUE_HBAR ?? DEFAULT_HTS_CREATE_TOKEN_VALUE_HBAR,
  );

  data.createTokenGasLimit = createTokenGasLimit;
  data.createTokenGasPrice = createTokenGasPrice;
  data.createTokenValue = createTokenValue;
  data.managerFunding = managerFunding;

  const factory = await ethers.getContractFactory("HtsTokenManager", deployer);
  const manager = await factory.deploy(ethers.ZeroAddress, {
    gasLimit: HTS_MANAGER_DEPLOY_GAS_LIMIT,
  });
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

  if (managerFunding > 0n) {
    const fundingTx = await deployer.sendTransaction({
      to: managerAddress,
      value: managerFunding,
      gasLimit: 100_000n,
    });
    const fundingReceipt = await fundingTx.wait();

    data.funding = {
      hash: fundingReceipt?.hash,
      blockNumber: fundingReceipt?.blockNumber,
      status: fundingReceipt?.status,
      gasUsed: fundingReceipt?.gasUsed,
      managerBalanceAfterFunding: await provider.getBalance(managerAddress),
    };
  } else {
    data.funding = {
      skipped: true,
      reason: "HEDERA_HTS_MANAGER_FUNDING_HBAR is 0",
      managerBalance: await provider.getBalance(managerAddress),
    };
  }

  const createTx = await manager.createSampleTokenUnchecked({
    gasLimit: createTokenGasLimit,
    gasPrice: createTokenGasPrice,
    value: createTokenValue,
  });
  data.createSampleTokenRequest = {
    hash: createTx.hash,
    type: createTx.type,
    nonce: createTx.nonce,
    gasLimit: createTx.gasLimit,
    gasPrice: createTx.gasPrice,
    maxFeePerGas: createTx.maxFeePerGas,
    maxPriorityFeePerGas: createTx.maxPriorityFeePerGas,
    value: createTx.value,
    to: createTx.to,
    from: createTx.from,
  };
  const createReceipt = await createTx.wait();
  const tokenAddress = await manager.token();
  const createResponseCode = await manager.lastResponseCode();

  data.createSampleToken = {
    hash: createReceipt?.hash,
    blockNumber: createReceipt?.blockNumber,
    status: createReceipt?.status,
    gasUsed: createReceipt?.gasUsed,
    gasPrice: createReceipt?.gasPrice,
    tokenAddress,
    responseCode: createResponseCode,
  };

  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    data.mint = {
      skipped: true,
      reason: "Token was not created successfully",
    };
  } else {
    const mintTx = await manager.mintUnchecked(100, {
      gasLimit: HTS_MINT_GAS_LIMIT,
    });
    const mintReceipt = await mintTx.wait();
    const mintResponseCode = await manager.lastResponseCode();

    data.mint = {
      hash: mintReceipt?.hash,
      blockNumber: mintReceipt?.blockNumber,
      status: mintReceipt?.status,
      gasUsed: mintReceipt?.gasUsed,
      responseCode: mintResponseCode,
    };
  }
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
