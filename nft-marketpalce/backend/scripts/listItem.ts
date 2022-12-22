import { getNamedAccounts, ethers, network } from 'hardhat';
import { networkConfig, nftDefaultPrice } from '../helper-hardhat-config';
import { BasicNft, NftMarketplace } from '../typechain-types';

async function main() {
  const { deployer } = await getNamedAccounts();
  const basicNft = await ethers.getContract<BasicNft>('BasicNft', deployer);
  const nftMarketplace = await ethers.getContract<NftMarketplace>(
    'NftMarketplace',
    deployer
  );

  // Minting nft
  const mintTxRes = await basicNft.mintNft();
  const mintTxRec = await mintTxRes.wait(
    networkConfig[network.name].confirmations
  );
  const tokenId = mintTxRec.events![0].args?.tokenId;

  // Approving to the marketplace
  const approveTxRes = await basicNft.approve(nftMarketplace.address, tokenId);
  await approveTxRes.wait(networkConfig[network.name].confirmations);

  // Listing NFT on the marketplace
  const listTxRes = await nftMarketplace.listItem(
    basicNft.address,
    tokenId,
    nftDefaultPrice
  );
  await listTxRes.wait(networkConfig[network.name].confirmations);
}

main()
  .then(() => {
    console.log('Item is listed');
  })
  .catch(err => {
    if (err instanceof Error) console.error(err.message);
    else console.error(err);
  });
