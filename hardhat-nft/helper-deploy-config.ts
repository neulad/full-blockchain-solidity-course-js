export const devChains = ['hardhat', 'localhost'];

interface NetworkProperties {
  [propName: string]: {
    priceFeedAddress: string;
    waitConfirmations: number;
  };
}

export const networkConfig: NetworkProperties = {
  goerli: {
    priceFeedAddress: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    waitConfirmations: 6,
  },
};
