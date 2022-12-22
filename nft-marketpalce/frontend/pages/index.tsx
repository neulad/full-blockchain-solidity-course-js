import { gql, useQuery } from '@apollo/client';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useMoralis } from 'react-moralis';
import Item from '../components/Item';
import { ItemProps } from '../components/Item';

const GET_ACTIVE_ITEM = gql`
  {
    activeItems(
      first: 10
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

const Home: NextPage = () => {
  const { isWeb3Enabled, account } = useMoralis();
  const { loading, error, data } = useQuery(GET_ACTIVE_ITEM);
  const [quantityDots, setQuantityDots] = useState(1);

  useEffect(() => {
    console.log('activated');
    if (!isWeb3Enabled || loading) {
      const interval = setInterval(() => {
        setQuantityDots(dots => {
          if (dots < 3) {
            return dots + 1;
          } else {
            return 1;
          }
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isWeb3Enabled, loading]);

  return error ? (
    <div className="container mx-auto text-lg font-bold">
      <span>Sorry, and error took place:</span>{' '}
      <span className="text-red-600">{error.message}</span>
      <br />
      <span>Try agan</span>
    </div>
  ) : isWeb3Enabled ? (
    loading ? (
      <h1 className="container mx-auto text-lg font-bold">
        Loading your data
        <span>{'.'.repeat(quantityDots)}</span>
      </h1>
    ) : (
      <div className="container mx-auto flex md:justify-start gap-6 flex-wrap sm:justify-center">
        {data.activeItems.map((item: ItemProps, index: number) => {
          const { price, nftAddress, tokenId, seller } = item;

          return (
            <Item
              key={index}
              price={price}
              nftAddress={nftAddress}
              tokenId={tokenId}
              seller={seller}
            />
          );
        })}
      </div>
    )
  ) : (
    <h1 className="container mx-auto text-lg font-bold">
      Web3 is disabled, awaiting until you connect
      <span>{'.'.repeat(quantityDots)}</span>
    </h1>
  );
};

export default Home;
