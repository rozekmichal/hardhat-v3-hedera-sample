import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

const HTS_SYSTEM_CONTRACT = "0x0000000000000000000000000000000000000167";

describe("HtsTokenManager", async function () {
  const { ethers, networkHelpers } = await network.create();

  it("tests HTS-facing code with a mocked 0x167 system contract", async function () {
    const [deployer] = await ethers.getSigners();

    const mockFactory = await ethers.getContractFactory("MockHederaTokenServiceLite");
    const mock = await mockFactory.deploy();
    await mock.waitForDeployment();

    await networkHelpers.setCode(
      HTS_SYSTEM_CONTRACT,
      await ethers.provider.getCode(await mock.getAddress()),
    );

    const htsMockAtSystemAddress = mock.attach(HTS_SYSTEM_CONTRACT);
    await htsMockAtSystemAddress.setNextToken("0x0000000000000000000000000000000000001234");

    const managerFactory = await ethers.getContractFactory("HtsTokenManager");
    const manager = await managerFactory.deploy(ethers.ZeroAddress);
    await manager.waitForDeployment();
    const managerAddress = await manager.getAddress();

    await manager.createSampleToken({ value: ethers.parseEther("1") });
    assert.equal(await manager.token(), "0x0000000000000000000000000000000000001234");
    assert.equal(await htsMockAtSystemAddress.lastTreasury(), managerAddress);
    assert.equal(await htsMockAtSystemAddress.lastValue(), ethers.parseEther("1"));

    await manager.mint(500);
    await manager.burn(100);
  });
});
