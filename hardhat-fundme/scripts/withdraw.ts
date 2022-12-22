import { ethers, getNamedAccounts } from 'hardhat';
import { FundMe } from '../typechain-types';

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe: FundMe = await ethers.getContract('FundMe');

  console.log('Starting withdraw...');
  const txRes = await fundMe.withdraw();
  await txRes.wait(1);
  console.log('Withdrawed!');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
