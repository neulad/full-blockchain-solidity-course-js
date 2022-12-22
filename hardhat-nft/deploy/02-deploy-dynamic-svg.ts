import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import { devChains, networkConfig } from '../helper-deploy-config';
import { network } from 'hardhat';
import * as fs from 'fs';
import { verify } from '../utils/verify';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const lowSvg = fs.readFileSync('./images/low.svg', 'utf8');
  const highSvg = fs.readFileSync('./images/high.svg', 'utf8');

  if (!devChains.includes(network.name)) {
    const dynamicSvg = await deploy('DynamicSvg', {
      from: deployer,
      log: true,
      args: [networkConfig[network.name].priceFeedAddress, lowSvg, highSvg],
      waitConfirmations: networkConfig[network.name].waitConfirmations,
    });

    console.log(lowSvg);
    await verify(dynamicSvg.address, [
      networkConfig[network.name].priceFeedAddress,
      lowSvg,
      highSvg,
    ]);
  } else {
    log("I don't get run on local environment, change to test network!");
  }
};

export default func;
func.tags = ['all', 'dynamic-svg'];
