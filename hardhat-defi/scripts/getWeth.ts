import { getNamedAccounts, ethers } from 'hardhat';

export async function getWeth() {
  const deployer = (await ethers.getSigners())[0];
  const iWeth = await ethers.getContractAt(
    'IWeth',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    deployer
  );

  const tx = await iWeth.deposit({ value: ethers.utils.parseEther('0.02') });
  await tx.wait(1);

  const iWethBalance = await iWeth.balanceOf(deployer.address);
  console.log(
    `Got ${ethers.utils.formatEther(iWethBalance).toString()} of weth!`
  );
}

getWeth()
  .then(() => {
    console.log('Finished getting WETH!');
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
