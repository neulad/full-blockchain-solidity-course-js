import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { devChains, networksConfig } from '../../helper-hardhat-config';
import { expect } from 'chai';
import { MyToken } from '../../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers';

!devChains.includes(network.name)
  ? describe.skip
  : describe('MyToken', function () {
      let MyToken: MyToken;
      let deployer: string;

      beforeEach(async function () {
        await deployments.fixture('all');

        ({ deployer } = await getNamedAccounts());
        MyToken = await ethers.getContract('MyToken', deployer);
      });

      describe('constructor', function () {
        it('creates correct initial supply', async function () {
          const initialSupply = await MyToken.totalSupply();

          expect(initialSupply).to.be.equal(
            networksConfig[network.name].initialSupply
          );
        });

        it('sends all initial supply to a creator', async function () {
          const creatorBalance = await MyToken.balanceOf(deployer);

          expect(creatorBalance).to.be.equal(
            networksConfig[network.name].initialSupply
          );
        });

        describe('transfer', function () {
          it('transfers tokens to another user', async function () {
            const receiver = (await ethers.getSigners())[1];

            await MyToken.transfer(receiver.address, 1);

            expect(await MyToken.balanceOf(receiver.address)).to.be.equal(1);
          });

          it('reverts because balance is insufficient', async function () {
            const receiver = (await ethers.getSigners())[1];
            const receiverContract = MyToken.connect(receiver);

            await expect(
              receiverContract.transfer(deployer, 1000)
            ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
          });

          it('emits a Transfer event', async function () {
            const receiver = (await ethers.getSigners())[1];

            await expect(MyToken.transfer(receiver.address, 1))
              .to.emit(MyToken, 'Transfer')
              .withArgs(deployer, receiver.address, 1);
          });
        });

        describe('Tests with allowances', function () {
          let spender: string;

          beforeEach(async function () {
            spender = (await ethers.getSigners())[1].address;
            await MyToken.approve(spender, 1);
          });

          describe('approve', function () {
            it('sets correct allowance', async function () {
              expect(await MyToken.allowance(deployer, spender));
            });

            it('emits Approval event', async function () {
              await expect(MyToken.approve(spender, 1))
                .to.emit(MyToken, 'Approval')
                .withArgs(deployer, spender, 1);
            });
          });

          describe('increaseAllowance', function () {
            it('increases allowance ', async function () {
              await MyToken.increaseAllowance(spender, 1);
              const allowance = await MyToken.allowance(deployer, spender);

              expect(allowance).to.be.equal(2);
            });
          });

          describe('decreaseAllowance', function () {
            it('decreases allowance', async function () {
              await MyToken.decreaseAllowance(spender, 1);
              const allowance = await MyToken.allowance(deployer, spender);

              expect(allowance).to.be.equal(0);
            });
          });
        });

        describe('transferFrom', function () {
          it('send some tokens from the allowance', async function () {
            const receiver = (await ethers.getSigners())[2];
            const spender = (await ethers.getSigners())[1];
            await MyToken.approve(spender.address, 1);

            const spenderContract = MyToken.connect(spender);
            await spenderContract.transferFrom(deployer, receiver.address, 1);

            expect(await MyToken.balanceOf(receiver.address)).to.be.equal(1);
          });
        });
      });
    });
