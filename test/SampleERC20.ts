import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("SampleERC20", async function () {
  const { ethers } = await network.create();

  it("mints the initial supply to the deployer", async function () {
    const [deployer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SampleERC20");
    const token = await factory.deploy(deployer.address);

    await token.waitForDeployment();

    assert.equal(await token.balanceOf(deployer.address), await token.totalSupply());
    assert.equal(await token.symbol(), "HHS");
  });
});
