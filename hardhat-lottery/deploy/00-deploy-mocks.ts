import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import {
  BASE_FEE_VRF_V2,
  devChains,
  GAS_PRICE_LINK_VRF_V2,
} from '../helper-hardhat-config';
import { network } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  if (devChains.includes(network.name)) {
    log(`Test network ${network.name} is detected!`);
    log('Deploying mocks...');

    await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      log: true,
      args: [BASE_FEE_VRF_V2, GAS_PRICE_LINK_VRF_V2],
    });

    log('Mocks have been deployed!');
  }
};

export default func;
func.tags = ['all', 'mocks'];
