import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { experimentalAddHardhatNetworkMessageTraceHook } from 'hardhat/config';
import {
  BASE_FEE_VRF_V2,
  devChains,
  networkConfig,
} from '../../helper-hardhat-config';
import { Raffle, VRFCoordinatorV2Mock } from '../../typechain-types';
import { expect } from 'chai';
import { ContractReceipt, ContractTransaction } from 'ethers';

!devChains.includes(network.name)
  ? describe.skip
  : describe('Raffle', async function () {
      let raffle: Raffle;
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
      let deployer: string;

      beforeEach(async function () {
        ({ deployer } = await getNamedAccounts());
        await deployments.fixture(['all']);

        raffle = await ethers.getContract('Raffle', deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer
        );

        /**
         * You need to add a consumer. Otherwise an error `InvalidConsumer arises `
         * in VRFCoordinatorV2Mock contract
         */
        await vrfCoordinatorV2Mock.addConsumer(
          await raffle.getSubscriptionId(),
          raffle.address
        );
      });

      describe('constructor', function () {
        it('returns state equal to OPEN', async function () {
          expect(await raffle.getRaffleState()).to.be.equal(0);
        });

        it('returns appropriate interval', async function () {
          expect(await raffle.getInterval()).to.be.equal(
            networkConfig[network.name].interval
          );
        });
      });

      describe('enterRaffle', function () {
        it('reverts because contract is in `CALCULATING` state', async function () {
          await raffle.enterRaffle({ value: BASE_FEE_VRF_V2 });

          await network.provider.send('evm_increaseTime', [
            Number(networkConfig[network.name].interval + 1),
          ]);
          await network.provider.send('evm_mine');

          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: BASE_FEE_VRF_V2 })
          ).to.be.revertedWithCustomError(raffle, 'Raffle__NotOpen');
        });

        it('reverts because not enough funds', async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            'Raffle__InsufficientStake'
          );
        });

        it('pushes user to a list of participants', async function () {
          const txRes = await raffle.enterRaffle({ value: BASE_FEE_VRF_V2 });
          await txRes.wait(1);
          expect(await raffle.getParticipants()).to.include(deployer);
        });

        it("emits an event with participant's address", async function () {
          await expect(
            raffle.enterRaffle({
              value: BASE_FEE_VRF_V2,
            })
          )
            .to.emit(raffle, 'RaffleEnter')
            .withArgs(deployer);
        });
      });

      describe('checkUpkeep', function () {
        it('returns false because no ETH has been sent', async function () {
          await network.provider.send('evm_increaseTime', [
            Number(networkConfig[network.name].interval + 1),
          ]);
          await network.provider.send('evm_mine');

          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          expect(upKeepNeeded).to.be.false;
        });

        it('returns false because Raffle state is not `OPEN`', async function () {
          await raffle.enterRaffle({ value: BASE_FEE_VRF_V2 });

          await network.provider.send('evm_increaseTime', [
            Number(networkConfig[network.name].interval + 1),
          ]);
          await network.provider.send('evm_mine');

          await raffle.performUpkeep([]);

          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          expect(upKeepNeeded).to.be.false;
        });
      });

      describe('performUpkeep', function () {
        it('emits event of winning', async function () {
          await raffle.enterRaffle({ value: BASE_FEE_VRF_V2 });
          await network.provider.send('evm_increaseTime', [
            Number(networkConfig[network.name].interval + 1),
          ]);

          await network.provider.send('evm_mine');

          await expect(raffle.performUpkeep([])).to.emit(
            raffle,
            'RequestRaffleWinner'
          );
        });

        it('reverts because `checkUpkeep` is false', async function () {
          await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(
            raffle,
            'Raffle__UpkeepNotNeeded'
          );
        });

        it('changes state approprtiately', async function () {
          await raffle.enterRaffle({ value: BASE_FEE_VRF_V2 });
          await network.provider.send('evm_increaseTime', [
            Number(networkConfig[network.name].interval + 1),
          ]);

          await network.provider.send('evm_mine');

          await raffle.performUpkeep([]);

          expect(await raffle.getRaffleState()).to.be.equal(1);
        });
      });

      describe('fulfillRandomWords', function () {
        it("reverts because request doesn't exist", async function () {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith('nonexistent request');
        });
      });
    });
