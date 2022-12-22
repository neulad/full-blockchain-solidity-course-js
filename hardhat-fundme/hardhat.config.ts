import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import './tasks/block-number';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-deploy';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY as string],
      chainId: 4,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: { enabled: true },
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
  },
};

export default config;
