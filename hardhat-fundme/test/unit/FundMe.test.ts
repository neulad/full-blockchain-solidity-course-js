import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { devChains } from '../../helper-hardhat-config';
import { FundMe, MockV3Aggregator } from '../../typechain-types';

const ETH_TO_WEI = ethers.utils.parseEther('1');

!devChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async function () {
      let fundMe: FundMe;
      let deployer: string;
      let mockV3Aggregator: MockV3Aggregator;

      beforeEach(async function () {
        ({ deployer } = await getNamedAccounts());
        await deployments.fixture(['all']);
        fundMe = await ethers.getContract('FundMe', deployer);
        mockV3Aggregator = await ethers.getContract(
          'MockV3Aggregator',
          deployer
        );
      });

      describe('constructor', async function () {
        it('sets the aggregator addresses correctly', async function () {
          const response = await fundMe.priceFeed();

          expect(response).to.be.equal(mockV3Aggregator.address);
        });
      });

      describe('fund', async function () {
        it('should fail because insignificant fund', async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            'You need to spend more ETH!'
          );
        });

        it('updates the amount funded data structure', async function () {
          await fundMe.fund({ value: ETH_TO_WEI });
          const response = await fundMe.addressToAmountFunded(deployer);

          expect(response.toString()).to.be.equal(ETH_TO_WEI.toString());
        });

        it('adds sender to the list of funders', async function () {
          await fundMe.fund({
            value: ETH_TO_WEI,
            from: deployer,
          });

          const response = await fundMe.funders(0);

          expect(response).to.be.equal(deployer);
        });
      });

      describe('withdraw', async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: ETH_TO_WEI });
        });

        it('withdraws all eth from the contract', async function () {
          const initialBalanceOfContract = await fundMe.provider.getBalance(
            fundMe.address
          );

          const initialBalanceOfDeployer = await fundMe.provider.getBalance(
            deployer
          );

          const txRes = await fundMe.withdraw();
          const { gasUsed, effectiveGasPrice } = await txRes.wait(1);
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const finalBalanceOfContract = await fundMe.provider.getBalance(
            fundMe.address
          );
          const finalBalanceOfDeployer = await fundMe.provider.getBalance(
            deployer
          );

          expect(finalBalanceOfContract).to.be.equal(0);

          expect(
            initialBalanceOfContract.add(initialBalanceOfDeployer).toString()
          ).to.be.equal(finalBalanceOfDeployer.add(gasCost).toString());
        });

        it('allows to withdraw with multiple funders', async function () {
          const accounts = await ethers.getSigners();

          for (let i = 0; i < 6; i++) {
            const accountsFundMe = fundMe.connect(accounts[i]);

            await accountsFundMe.fund({ value: ETH_TO_WEI });
          }

          const initialBalanceOfContract = await fundMe.provider.getBalance(
            fundMe.address
          );
          const initialBalanceOfDeployer = await fundMe.provider.getBalance(
            deployer
          );

          const txRes = await fundMe.withdraw();
          const { gasUsed, effectiveGasPrice } = await txRes.wait(1);
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const finalBalanceOfContract = await fundMe.provider.getBalance(
            fundMe.address
          );
          const finalBalanceOfDeployer = await fundMe.provider.getBalance(
            deployer
          );

          expect(finalBalanceOfContract).to.be.equal(0);

          expect(
            initialBalanceOfDeployer.add(initialBalanceOfContract).toString()
          ).to.be.equal(finalBalanceOfDeployer.add(gasCost).toString());
        });

        it('empties the list of funders', async function () {
          const accounts = await ethers.getSigners();

          for (let i = 0; i < 6; i++) {
            const accountsFundMe = fundMe.connect(accounts[i]);

            await accountsFundMe.fund({ value: ETH_TO_WEI });
          }

          const txRes = await fundMe.withdraw();
          await txRes.wait(1);

          await expect(fundMe.funders(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            expect(
              await fundMe.addressToAmountFunded(accounts[i].address)
            ).to.be.equal(0);
          }
        });

        it('reverts because of OnlyOwner modifier', async function () {
          const accounts = await ethers.getSigners();

          const attackersFundMe = fundMe.connect(accounts[1]);
          await expect(attackersFundMe.withdraw()).revertedWithCustomError(
            fundMe,
            'FundMe__NotOwner'
          );
        });
      });
    });
