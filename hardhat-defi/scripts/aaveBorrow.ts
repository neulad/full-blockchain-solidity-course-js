import * as hre from 'hardhat';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { getWeth } from './getWeth';
import { ILendingPool } from '../typechain-types';

async function main() {
  const deployer = (await ethers.getSigners())[0];
  await getWeth();

  const lendingPool = await getLendingPool(deployer);

  await approveWethToaave(
    deployer,
    lendingPool.address,
    ethers.utils.parseEther('0.02')
  );

  await lendingPool.deposit(
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ethers.utils.parseEther('0.02'),
    deployer.address,
    0
  );
  console.log('Deposited!');

  const availabeEthToBorrow = Number(
    ethers.utils.formatEther(
      (await getAccountData(lendingPool, deployer.address)).availableBorrowsETH
    )
  );
  const daiToEth = Number(ethers.utils.formatEther(await getDAIPrice()));

  // 0.95 is used not to cross the liquidation
  const availableDaiToBorrow = availabeEthToBorrow * (1 / daiToEth) * 0.95;

  console.log(`You can borrow ${availableDaiToBorrow} dai!`);

  await borrowDai(
    lendingPool,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ethers.utils.parseEther(availableDaiToBorrow.toString()),
    1,
    0,
    deployer.address
  );

  const daiBorrowed = (await getAccountData(lendingPool, deployer.address))
    .totalDebtETH;
}

async function borrowDai(
  lendingPool: ILendingPool,
  asset: string,
  amount: BigNumber,
  interestRateMode: number,
  referralCode: number,
  onBehalfOf: string
) {
  const tx = await lendingPool.borrow(
    asset,
    amount,
    interestRateMode,
    referralCode,
    onBehalfOf
  );
  await tx.wait(1);
}

async function getAccountData(lendingPool: ILendingPool, account: string) {
  const data = await lendingPool.getUserAccountData(account);

  return data;
}

async function getDAIPrice() {
  const daiToEthPriceFeed = await ethers.getContractAt(
    'AggregatorV3Interface',
    '0x773616E4d11A78F511299002da57A0a94577F1f4'
  );

  const daiToEth = (await daiToEthPriceFeed.latestRoundData())[1];

  return daiToEth;
}

async function getLendingPool(deployer: any) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    'ILendingPoolAddressesProvider',
    '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
    deployer
  );

  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    'ILendingPool',
    lendingPoolAddress,
    deployer
  );

  console.log(`lendingPoolAddress is ${lendingPool.address}`);
  return lendingPool;
}

async function approveWethToaave(
  owner: any,
  spender: string,
  amount: BigNumber
) {
  const Weth = await ethers.getContractAt(
    'IERC20',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    owner
  );

  const tx = await Weth.approve(spender, amount);
  await tx.wait(1);

  const wethAmount = await Weth.allowance(owner.address, spender);
  console.log(`Approved ${ethers.utils.formatEther(wethAmount)} weth to aave`);
}

main()
  .then(() => {
    console.log('aave is borrowed!');
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
