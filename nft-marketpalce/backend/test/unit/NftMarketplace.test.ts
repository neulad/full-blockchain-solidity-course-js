import { devChains } from '../../helper-hardhat-config';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { NftMarketplace } from '../../typechain-types';
import { BasicNft } from '../../typechain-types/contracts/mock';
import { expect } from 'chai';
import func from '../../deploy/01-deploy-nft-marketplace';

!devChains.includes(network.name)
  ? describe.skip
  : describe('NftMarketplace', function () {
      let nftMarketplace: NftMarketplace;
      let basicNft: BasicNft;
      let deployer: string;

      beforeEach(async function () {
        await deployments.fixture(['all']);
        ({ deployer } = await getNamedAccounts());
        nftMarketplace = await ethers.getContract('NftMarketplace', deployer);
        basicNft = await ethers.getContract('BasicNft', deployer);

        await basicNft.mintNft();
        await basicNft.approve(nftMarketplace.address, 0);
      });

      describe('listItem', function () {
        it("reverts because token hasn't been approved", async function () {
          // Mint new NFT to get new token which is not approved
          await basicNft.mintNft();

          await expect(
            nftMarketplace.listItem(basicNft.address, 1, 100)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            'NftMarketplace__NotApprovedForMarketPlace'
          );
        });

        it('reverts because of wrong tokenId', async function () {
          await expect(
            nftMarketplace.listItem(basicNft.address, 99, 100)
          ).to.be.revertedWith('ERC721: invalid token ID');
        });

        it('reverts because price is below zero', async function () {
          await expect(
            nftMarketplace.listItem(basicNft.address, 0, 0)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            'NftMarketplace__InsufficientPrice'
          );
        });

        it('reverts because not an owner', async function () {
          const accounts = await ethers.getSigners();
          const newNftMarketplace = nftMarketplace.connect(accounts[1]);

          await expect(
            newNftMarketplace.listItem(basicNft.address, 0, 100)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            'NftMarketplace__NotOwner'
          );
        });

        it('reverts because already listed', async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);

          await expect(
            nftMarketplace.listItem(basicNft.address, 0, 500)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            'NftMarketplace__AlreadyListed'
          );
        });

        it('emits ItemListed event', async function () {
          await expect(
            nftMarketplace.listItem(basicNft.address, 0, 100)
          ).to.emit(nftMarketplace, 'ItemListed');
        });

        it('updates s_listings with new listing', async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
          const listing = await nftMarketplace.getListing(basicNft.address, 0);
          const price = listing.price;
          const seller = listing.seller;

          expect(price).to.be.equal(100);
          expect(seller).to.be.equal(deployer);
        });
      });

      describe('buyItem', function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
        });

        it("reverts because price condition hasn't been met", async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.address, 0)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            'NftMarketplace__PriceNotMet'
          );
        });

        it('reverts because item is not listed', async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.address, 99)
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            'NftMarketplace__NotListed'
          );
        });

        it('deletes listing', async function () {
          await nftMarketplace.buyItem(basicNft.address, 0, {
            value: 100,
          });

          const price = (await nftMarketplace.getListing(basicNft.address, 0))
            .price;

          expect(price).to.be.equal(0);
        });

        it('increases s_proceeds', async function () {
          await nftMarketplace.buyItem(basicNft.address, 0, {
            value: 100,
          });

          const proceeding = await nftMarketplace.getProceeds(deployer);

          expect(proceeding).to.be.equal(100);
        });

        it('emits ItemBought event', async function () {
          await expect(
            nftMarketplace.buyItem(basicNft.address, 0, {
              value: 100,
            })
          ).to.emit(nftMarketplace, 'ItemBought');
        });
      });

      describe('updateListing', function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
        });

        it('updates the listing', async function () {
          await nftMarketplace.updateListing(basicNft.address, 0, 5_000_000);

          const updatedListing = await nftMarketplace.getListing(
            basicNft.address,
            0
          );

          expect(updatedListing.price).to.be.equal(5_000_000);
        });

        it('emits ItemListed event', async function () {
          await expect(
            nftMarketplace.updateListing(basicNft.address, 0, 5_000_000)
          ).to.emit(nftMarketplace, 'ItemListed');
        });
      });

      describe('withdrawProceeds', function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
          await nftMarketplace.buyItem(basicNft.address, 0, {
            value: 100,
          });
        });

        it('reverts because no proceeds', async function () {
          const accounts = await ethers.getSigners();
          const newNftMarketplace = nftMarketplace.connect(accounts[1]);

          await expect(
            newNftMarketplace.withdrawProceeds()
          ).to.be.revertedWithCustomError(
            newNftMarketplace,
            'NftMarketplace__NoProceeds'
          );
        });

        it('resets s_proceeds', async function () {
          await nftMarketplace.withdrawProceeds();
          const proceeding = await nftMarketplace.getProceeds(deployer);

          expect(proceeding).to.be.equal(0);
        });

        it("increases user's balance", async function () {
          const initialBalance = await ethers.provider.getBalance(deployer);
          const proceeding = await nftMarketplace.callStatic.getProceeds(
            deployer
          );
          const txRes = await nftMarketplace.withdrawProceeds();
          const { gasUsed, effectiveGasPrice } = await txRes.wait(1);
          const gasSpent = gasUsed.mul(effectiveGasPrice);
          const finalBalance = await ethers.provider.getBalance(deployer);

          expect(finalBalance).to.be.equal(
            initialBalance.add(proceeding).sub(gasSpent)
          );
        });
      });

      describe('cancelListing', function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
        });

        it('deletes listing from s_listings', async function () {
          await nftMarketplace.cancelListing(basicNft.address, 0);
          const price = (await nftMarketplace.getListing(basicNft.address, 0))
            .price;

          expect(price).to.be.equal(0);
        });

        it('emits an ItemCancelled event', async function () {
          await expect(
            nftMarketplace.cancelListing(basicNft.address, 0)
          ).to.emit(nftMarketplace, 'ItemCancelled');
        });
      });

      describe('getListing', function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
        });

        it('returns the listing', async function () {
          const listing = await nftMarketplace.getListing(basicNft.address, 0);

          expect(listing.price).to.be.equal(100);
          expect(listing.seller).to.be.equal(deployer);
        });
      });

      describe('getProceeds', function () {
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, 0, 100);
          await nftMarketplace.buyItem(basicNft.address, 0, {
            value: 100,
          });
        });

        it('returns correct proceeding', async function () {
          const proceeding = await nftMarketplace.getProceeds(deployer);

          expect(proceeding).to.be.equal(100);
        });
      });
    });
