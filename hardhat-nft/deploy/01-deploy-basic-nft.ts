import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/dist/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy('BasicNft', {
    from: deployer,
    log: true,
  });
};

export default func;
func.tags = ['all', 'basic-nft'];
