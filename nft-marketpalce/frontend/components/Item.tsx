import { SetStateAction, useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { ethers } from 'ethers';
import basicNftAbi from '../constants/BasicNft.json';
import Image from 'next/image';
import BuyItem from './BuyItem';

export interface ItemProps {
  key: number;
  price: number;
  nftAddress: string;
  tokenId: string;
  seller: string;
}

const Item = ({ price, nftAddress, tokenId, seller }: ItemProps) => {
  const { isWeb3Enabled } = useMoralis();
  const [imageUrl, setImageUrl] = useState('');
  const [tokenName, setTokenName] = useState();
  const [tokenDescription, setTokenDescription] = useState('');
  const { runContractFunction: getTokenUri } = useWeb3Contract({
    abi: basicNftAbi,
    contractAddress: nftAddress,
    functionName: 'TOKEN_URI',
  });

  async function updateUi() {
    const tokenUri = (await getTokenUri()) as string;

    if (tokenUri) {
      const tokenUrl = tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const tokenRes = await (await fetch(tokenUrl)).json();
      const imageUrl = tokenRes.image.replace(
        'ipfs://',
        'https://ipfs.io/ipfs/'
      );

      setTokenName(tokenRes.name);
      setTokenDescription(tokenRes.description);
      setImageUrl(imageUrl);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled]);

  return (
    <div>
      <div className="p-3 border-solid border-[#99a6c4] border-2 rounded-3xl bg-[#F2F6FF]">
        <div className="border-b-2 border-b-black">
          <Image
            loader={() => imageUrl}
            src={imageUrl}
            alt="NFT Image"
            width="300"
            height="300"
          ></Image>
        </div>

        <div className="mt-3">
          <div className="flex flex-b items-center  justify-between ">
            <p className="text-lg font-bold text-blue-600/80">{tokenName}</p>
            <p className=" text-blue-600/80">
              {ethers.utils.formatEther(price.toString()).toString()} ETH
            </p>
          </div>

          <div className="flex flex-b items-center  justify-between">
            <p className=" text-blue-600/80">{tokenDescription}</p>
            <p className=" text-blue-600/80">#{tokenId}</p>
          </div>

          <BuyItem nftAddress={nftAddress} tokenId={tokenId} price={price} />
        </div>
      </div>
    </div>
  );
};

export default Item;
