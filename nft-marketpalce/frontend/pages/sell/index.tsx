import { useMoralis, useWeb3Contract } from 'react-moralis';
import nftMarketPlaceAbi from '../../constants/NftMarketplace.json';
import basicNftAbi from '../../constants/BasicNft.json';
import { useNotification } from 'web3uikit';
import { FormEvent, useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';

const Sell = () => {
  const { account, isWeb3Enabled, chainId } = useMoralis();
  const [proceeds, setProceeds] = useState(0);
  const { runContractFunction } = useWeb3Contract({});

  useEffect(() => {
    updateUi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isWeb3Enabled, chainId]);

  const updateUi = async () => {
    const proceeds = await runContractFunction({
      params: {
        abi: nftMarketPlaceAbi,
        contractAddress: '0x3647D17a02aca29557bF20d23b9061a9692aDA4A',
        functionName: 'getProceeds',
        params: {
          seller: account,
        },
      },
    });

    console.log(proceeds);
    setProceeds(proceeds as number);
  };

  const dispatch = useNotification();

  const handleWithdraw = async () => {
    await runContractFunction({
      params: {
        abi: nftMarketPlaceAbi,
        contractAddress: '0x3647D17a02aca29557bF20d23b9061a9692aDA4A',
        functionName: 'withdrawProceeds',
      },

      onSuccess: () => {
        dispatch({
          type: 'success',
          title: 'Withdrawn!',
          message: 'Congarts! Check you wallet!',
          position: 'topR',
        });
      },

      onError: err => {
        dispatch({
          type: 'error',
          title: 'Error!',
          message: err.message,
          position: 'topR',
        });
      },
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const approveParams = {
      abi: basicNftAbi,
      contractAddress: (event.target as any).nftAddress.value,
      functionName: 'approve',
      params: {
        to: '0x3647D17a02aca29557bF20d23b9061a9692aDA4A',
        tokenId: (event.target as any).tokenId.value,
      },
    };

    await runContractFunction({
      params: approveParams,
      onError: err => {
        dispatch({
          type: 'error',
          title: 'Error!',
          message: err.message,
          position: 'topR',
        });
      },
      onSuccess: tx => {
        handleApproveSuccess(
          tx,
          (event.target as any).nftAddress.value,
          (event.target as any).tokenId.value,
          ethers.utils.parseUnits((event.target as any).price.value, 'ether')
        );
      },
    });
  };

  const handleApproveSuccess = async (
    tx: any,
    nftAddress: string,
    tokenId: string,
    price: BigNumber
  ) => {
    await tx.wait(1);

    const listItemParams = {
      abi: nftMarketPlaceAbi,
      contractAddress: '0x3647D17a02aca29557bF20d23b9061a9692aDA4A',
      functionName: 'listItem',
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price,
      },
    };

    await runContractFunction({
      params: listItemParams,
      onError: err => {
        console.error(err);
        dispatch({
          type: 'error',
          title: 'Error!',
          message: 'Make sure that this NFT is not listed already!',
          position: 'topR',
        });
      },

      onSuccess: () => {
        dispatch({
          type: 'success',
          title: 'Listed!',
          message: 'Congrats! Nft is listed',
          position: 'topR',
        });
      },
    });
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <p className="text-center text-3xl font-bold">
        List your own nft for selling!
      </p>
      <form
        className=" rounded px-8 pt-6 pb-8 mb-4 text-lg"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="nftAddress"
          >
            Nft Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nftAddress"
            type="text"
            pattern="^0x[a-fA-F0-9]{40}$"
            title="Please enter valid ethereum address"
            placeholder="0xn7tny57d..."
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tokenId"
          >
            Token ID
          </label>
          <input
            className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="tokenId"
            type="text"
            placeholder="21"
          />

          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="price"
          >
            Price in ETH
          </label>
          <input
            className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="price"
            type="text"
            placeholder="0.02"
          />
        </div>
        <div className="flex items-center justify-center mb-8">
          <button
            className="bg-blue-500 grow hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            List!
          </button>
        </div>

        <div>
          <div className="mb-3">
            <span>Your balance: </span>
            <span>
              {proceeds
                ? ethers.utils.formatEther(proceeds.toString()).toString() +
                  ' ETH'
                : '...'}
            </span>
          </div>
          <button
            onClick={handleWithdraw}
            className="bg-red-500 w-full  hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Withdraw
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sell;
