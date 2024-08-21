import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || "";
console.log("PrivateKey set:", !!ACCOUNT_PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  paths: {
    artifacts: "./src",
  },
  networks: {
    opencampus: {
      url: `https://rpc.open-campus-codex.gelato.digital/`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      opencampus: "xxx",
    },
    customChains: [
      {
        network: "opencampus",
        chainId: 656476,
        urls: {
          apiURL: "https://opencampus-codex.blockscout.com/api/",
          browserURL: "opencampus-codex.blockscout.com",
        },
      },
    ],
  },
};

export default config;