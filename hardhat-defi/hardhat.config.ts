import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'dotenv/config';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        enabled: true,
        url: process.env.MAINNET_RPC_URL!,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    compilers: [
      { version: '0.4.20' },
      { version: '0.8.9' },
      { version: '0.6.12' },
    ],
  },
};

export default config;
