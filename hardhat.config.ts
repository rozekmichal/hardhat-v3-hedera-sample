import type { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv(): void {
  if (!existsSync(".env")) {
    return;
  }

  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    process.env[key] ??= value.replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers, hardhatKeystore],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hederaTestnet: {
      type: "http",
      url: configVariable("HEDERA_TESTNET_RPC_URL"),
      chainId: 296,
      accounts: [configVariable("HEDERA_TESTNET_PRIVATE_KEY")],
    },
  },
};

export default config;
