import { ethers } from 'hardhat';

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory('SimpleStorage');

  console.log('Deploying SimpleStorage...');
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to ${simpleStorage.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
