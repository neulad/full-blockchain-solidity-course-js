export const devChains = ['hardhat', 'localhost'];

interface NetworkProperties {
  [networkName: string]: {
    initialSupply: number;
  };
}

export const networksConfig: NetworkProperties = {
  hardhat: {
    initialSupply: 100,
  },
  localhost: {
    initialSupply: 1000,
  },
  goerli: {
    initialSupply: 1_000_000,
  },
};
