import { ethers, getNamedAccounts } from 'hardhat';
import { FundMe } from '../typechain-types';

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe: FundMe = await ethers.getContract('FundMe');

  console.log('Starting funding...');
  const txRes = await fundMe.fund({ value: ethers.utils.parseEther('0.1') });
  await txRes.wait(1);
  console.log('Funded!');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
