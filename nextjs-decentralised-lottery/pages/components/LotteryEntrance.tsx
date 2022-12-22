import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { raffleAbi, raffleAddresses } from '../../constants';
import { utils, BigNumber, ContractTransaction } from 'ethers';
import { useNotification } from '@web3uikit/core';
import { spawn } from 'child_process';

const LotteryEntrance = () => {
  const {
    chainId: chainIdHex,
    isWeb3Enabled,
    isWeb3EnableLoading,
  } = useMoralis();
  const chainIdInt = parseInt(chainIdHex!);
  const dispatch = useNotification();
  const [entranceFee, setEntranceFee] = useState(BigNumber.from(0));
  const [recentWinner, setRecentWinner] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState(BigNumber.from(0));

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddresses[chainIdInt!],
    functionName: 'getEntranceFee',
  });

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddresses[chainIdInt!],
    functionName: 'enterRaffle',
    msgValue: entranceFee.add(1).toString(),
  });

  const { runContractFunction: getNumberOfParticipants } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddresses[chainIdInt!],
    functionName: 'getNumberOfParticipants',
  });

  const { runContractFunction: getLastWinner } = useWeb3Contract({
    abi: raffleAbi,
    contractAddress: raffleAddresses[chainIdInt!],
    functionName: 'getLastWinner',
  });

  async function updateUI() {
    const entranceFee = await getEntranceFee();
    const numberOfPlayers = await getNumberOfParticipants();
    const lastWinner = await getLastWinner();

    setNumberOfPlayers(numberOfPlayers as BigNumber);
    setRecentWinner(lastWinner as string);
    setEntranceFee(entranceFee as BigNumber);
  }

  useEffect(() => {
    if (isWeb3Enabled && chainIdInt === 5) {
      updateUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, chainIdHex]);

  return (
    <div className="mt-6">
      {raffleAddresses[chainIdInt!] ? (
        <div className="">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () => {
              await enterRaffle({
                onSuccess: async tx => {
                  await (tx as ContractTransaction).wait(1);
                  dispatch({
                    type: 'info',
                    message: 'trx complete!',
                    title: 'trx notification',
                    position: 'topR',
                  });

                  updateUI();
                },
                onError: err => {
                  console.error(err.message);
                },
              });
            }}
          >
            {!entranceFee.gt(BigNumber.from(0)) ||
            isLoading ||
            isFetching ||
            isWeb3EnableLoading ? (
              <div className="animate-spin h-4 w-4 border-b-2 rounded-full"></div>
            ) : (
              <span>Enter raffle!</span>
            )}
          </button>
          <div>
            <span>Entrance fee: </span>

            <span>{utils.formatUnits(entranceFee, 'ether')}</span>
          </div>
          <div>
            <span>Number of players: </span>
            <span>{numberOfPlayers.toString()}</span>
          </div>
          <div>
            <span>Recent winner: </span>
            <span>{recentWinner}</span>
          </div>
        </div>
      ) : (
        <div>No Raffle address detected. Check your network!</div>
      )}
    </div>
  );
};

export default LotteryEntrance;
