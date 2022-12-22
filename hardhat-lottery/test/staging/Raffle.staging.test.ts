import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { experimentalAddHardhatNetworkMessageTraceHook } from 'hardhat/config';
import {
  BASE_FEE_VRF_V2,
  devChains,
  networkConfig,
} from '../../helper-hardhat-config';
import { Raffle, VRFCoordinatorV2Mock } from '../../typechain-types';
import { expect } from 'chai';
import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';

devChains.includes(network.name)
  ? describe.skip
  : describe('Raffle', function () {
      let raffle: Raffle;
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
      let deployer: string;
      let finalTime: BigNumber;
      let winner: string;

      beforeEach(async function () {
        ({ deployer } = await getNamedAccounts());

        raffle = await ethers.getContract('Raffle', deployer);
      });

      describe('fulfillRandomWords', function () {
        it('randomly chooses a winner', async function () {
          const initialTime = await raffle.getLatestTimeStamp();
          const initialBalance = await ethers.provider.getBalance(deployer);

          console.log('Setting up listener...');
          await new Promise<void>(async (resolve, reject) => {
            raffle.once('WinnerPicked', async () => {
              try {
                console.log('event is captured!');
                finalTime = await raffle.getLatestTimeStamp();
                winner = await raffle.getLastWinner();

                resolve();
              } catch (err) {
                if (err instanceof Error) {
                  console.error(err.message);
                }
                reject(err);
              }
            });

            console.log('Entering the Raffle...');
            const txRes = await raffle.enterRaffle({ value: BASE_FEE_VRF_V2 });
            const txRec = await txRes.wait(1);
            console.log('Successfully entered the Raffle!');
          });

          expect(finalTime).to.be.at.least(initialTime);
          expect(winner).to.be.equal(deployer);
        });
      });
    });
