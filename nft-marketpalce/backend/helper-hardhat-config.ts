import { ethers } from 'hardhat';

export const devChains = ['hardhat', 'localhost'];
export const nftDefaultPrice = ethers.utils.parseEther('0.01');

interface NetworkProperties {
  [propName: string]: {
    confirmations: number;
  };
}

export const networkConfig: NetworkProperties = {
  goerli: {
    confirmations: 1,
  },

  hardhat: {
    confirmations: 1,
  },

  localhost: {
    confirmations: 1,
  },
};
