import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { networkConfig } from '../helper-hardhat-config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy('BasicNft', {
    from: deployer,
    log: true,
    waitConfirmations: networkConfig[network.name].confirmations,
  });
};

export default func;
func.tags = ['all', 'basic-nft'];
