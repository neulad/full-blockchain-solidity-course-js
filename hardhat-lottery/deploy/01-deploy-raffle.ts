import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { devChains, networkConfig } from '../helper-hardhat-config';
import { ethers, network } from 'hardhat';
import { VRFCoordinatorV2Mock } from '../typechain-types';
import { BigNumber } from 'ethers';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let vrfCoordinatorV2Address: string;
  let subscriptionId: BigNumber;

  if (devChains.includes(network.name)) {
    const vrfCoordinatorV2 = await ethers.getContract<VRFCoordinatorV2Mock>(
      'VRFCoordinatorV2Mock'
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2.address;

    const txRes = await vrfCoordinatorV2.createSubscription();
    const txRec = await txRes.wait(1);

    subscriptionId = txRec.events![0].args?.subId;
  } else {
    vrfCoordinatorV2Address =
      networkConfig[network.name].vrfCoordinatorAddress!;
    subscriptionId = networkConfig[network.name].subscriptionId!;
  }

  const raffle = await deploy('Raffle', {
    from: deployer,
    log: true,
    args: [
      networkConfig[network.name].gasLane,
      subscriptionId,
      networkConfig[network.name].callbackGasLimit,
      networkConfig[network.name].entranceFee,
      vrfCoordinatorV2Address,
      networkConfig[network.name].interval,
    ],
    waitConfirmations: 1,
  });
};

export default func;
func.tags = ['all', 'raffle'];
