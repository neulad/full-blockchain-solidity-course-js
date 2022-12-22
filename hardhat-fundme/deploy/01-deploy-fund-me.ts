import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import {
  devChains,
  networkChainlinkFeeds as prodChainlinkFeeds,
} from '../helper-hardhat-config';
import { deployments, network } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let ethUsdPriceFeedAddress: string;

  if (devChains.includes(network.name)) {
    ethUsdPriceFeedAddress = (await deployments.get('MockV3Aggregator'))
      .address;
  } else {
    ethUsdPriceFeedAddress =
      prodChainlinkFeeds[network.name].ethUsdPriceFeedAddress;
  }

  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: 1,
  });
};

export default func;
func.tags = ['all', 'fundme'];
