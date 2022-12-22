import { network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { networksConfig } from '../helper-hardhat-config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy('MyToken', {
    from: deployer,
    log: true,
    args: [networksConfig[network.name].initialSupply],
  });
};

export default func;
func.tags = ['all', 'mytoken'];
