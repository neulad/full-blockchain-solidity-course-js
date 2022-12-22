export interface ChainlinkFeeds {
  [propName: string]: {
    ethUsdPriceFeedAddress: string;
  };
}

export const networkChainlinkFeeds: ChainlinkFeeds = {
  rinkeby: {
    ethUsdPriceFeedAddress: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
};

// Mocking staff
export const devChains = ['hardhat', 'localhost'];
export const mockV3AggregatorArgs = [8, 200000000000];
