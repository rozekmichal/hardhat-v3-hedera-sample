import { network } from "hardhat";

const { ethers } = await network.create();

async function main(): Promise<void> {
  const [signer] = await ethers.getSigners();
  const provider = ethers.provider;

  console.log("Signer:", signer.address);
  console.log("Chain ID:", (await provider.getNetwork()).chainId.toString());
  console.log("Balance:", (await provider.getBalance(signer.address)).toString());

  const tx = await signer.sendTransaction({
    to: signer.address,
    value: 0n,
  });

  console.log("Submitted:", tx.hash);
  await tx.wait();
  console.log("Confirmed");
}

await main();
