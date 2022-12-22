import { expect } from 'chai';
import { ethers, getNamedAccounts, network } from 'hardhat';
import { devChains } from '../../helper-hardhat-config';
import { FundMe } from '../../typechain-types';

const ETH_TO_WEI = ethers.utils.parseEther('1');

!devChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async function () {
      let fundMe: FundMe;
      let deployer: string;

      beforeEach(async function () {
        ({ deployer } = await getNamedAccounts());
        fundMe = await ethers.getContract('FundMe', deployer);
      });

      it('allows people to fund and withdraw', async function () {
        await fundMe.fund({ value: ETH_TO_WEI.div(100000000000) });
        await fundMe.withdraw();

        const finalBalanceOfContract = await ethers.provider.getBalance(
          fundMe.address
        );

        expect(finalBalanceOfContract.toString()).to.be.equal('0');
      });
    });
