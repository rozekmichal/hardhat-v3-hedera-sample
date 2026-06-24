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
    const manager = await managerFactory.deploy(deployer.address);
    await manager.waitForDeployment();

    await manager.createSampleToken();
    assert.equal(await manager.token(), "0x0000000000000000000000000000000000001234");

    await manager.mint(500);
    await manager.burn(100);
  });
});
