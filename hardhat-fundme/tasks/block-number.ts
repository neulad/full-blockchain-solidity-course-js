import { task } from 'hardhat/config';

task('block-number', 'Get the latest block number').setAction(
  async (taskArguments, hre) => {
    const blockId = await hre.ethers.provider.getBlockNumber();
    console.log(blockId);
  }
);
