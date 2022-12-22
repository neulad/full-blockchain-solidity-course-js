import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

export const devChains = ['localhost', 'hardhat'];

export const BASE_FEE_VRF_V2 = ethers.utils.parseEther('0.01');
export const GAS_PRICE_LINK_VRF_V2 = 1e9;
export const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther('2');

interface NetworkProperties {
  [propName: string]: {
    vrfCoordinatorAddress?: string;
    entranceFee: BigNumber;
    gasLane: string;
    subscriptionId?: BigNumber;
    callbackGasLimit: string;
    interval: string;
  };
}

export const networkConfig: NetworkProperties = {
  goerli: {
    vrfCoordinatorAddress: '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
    entranceFee: ethers.utils.parseEther('0.001'),
    gasLane:
      '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
    subscriptionId: BigNumber.from('158'),
    callbackGasLimit: '500000',
    interval: '30',
  },

  hardhat: {
    entranceFee: BASE_FEE_VRF_V2,
    gasLane:
      '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
    callbackGasLimit: '500000',
    interval: '30',
  },
};
