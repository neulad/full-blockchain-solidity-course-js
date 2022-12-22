import { useWeb3Contract } from 'react-moralis';
import { useNotification } from 'web3uikit';
import nftMarketPlaceAbi from '../constants/NftMarketplace.json';

interface ButtonProps {
  nftAddress: string;
  tokenId: string;
  price: number;
}

const BuyItem = ({ nftAddress, tokenId, price }: ButtonProps) => {
  const dispatch = useNotification();

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketPlaceAbi,
    contractAddress: '0x3647D17a02aca29557bF20d23b9061a9692aDA4A',
    functionName: 'buyItem',
    msgValue: price,
    params: {
      nftAddress,
      tokenId,
    },
  });

  async function handleClick() {
    await buyItem({
      onError: error => console.error(error),
      onSuccess: () =>
        dispatch({
          type: 'success',
          message: 'Item bought!',
          title: 'Item Bought',
          position: 'topR',
        }),
    });
  }

  return (
    <button
      onClick={e => {
        handleClick();
      }}
      className="w-full text-center text-white py-1 bg-[#1489e3] mt-5 rounded-3xl hover:bg-white hover:text-[#1489e3]"
    >
      Buy NFT!
    </button>
  );
};

export default BuyItem;
