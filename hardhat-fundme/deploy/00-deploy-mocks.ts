import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { devChains, mockV3AggregatorArgs } from '../helper-hardhat-config';
import { network } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  if (devChains.includes(network.name)) {
    log('Test network is identified! Creating mocks...');
    await deploy('MockV3Aggregator', {
      from: deployer,
      log: true,
      args: mockV3AggregatorArgs,
    });

    log('Mocks have been created!');
  }
};

export default func;
func.tags = ['all', 'mocks'];
