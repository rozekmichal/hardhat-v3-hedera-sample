import { network } from "hardhat";
import { normalizeError, writeEvidence } from "./lib/evidence.js";

const startedAt = new Date().toISOString();

async function main(): Promise<void> {
  const connection = await network.create();
  const { ethers } = connection;
  const [signer] = await ethers.getSigners();
  const provider = ethers.provider;
  const networkInfo = await provider.getNetwork();
  const latestBlock = await provider.getBlock("latest");

  const data = {
    signer: signer.address,
    balance: await provider.getBalance(signer.address),
    latestBlock: latestBlock === null
      ? null
      : {
          number: latestBlock.number,
          hash: latestBlock.hash,
          timestamp: latestBlock.timestamp,
          transactions: latestBlock.transactions.length,
        },
  };

  await writeEvidence({
    ok: true,
    flow: "relay-diagnostics",
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
    flow: "relay-diagnostics",
    startedAt,
    finishedAt: new Date().toISOString(),
    error: normalizeError(error),
  });
  process.exitCode = 1;
}
