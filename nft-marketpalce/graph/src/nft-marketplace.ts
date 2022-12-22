import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  ItemBought as ItemBoughtEvent,
  ItemCancelled as ItemCancelledEvent,
  ItemListed as ItemListedEvent
} from '../generated/NftMarketplace/NftMarketplace';
import {
  ItemListed,
  ItemBought,
  ItemCancelled,
  ActiveItem
} from '../generated/schema';

export function handleItemBought(event: ItemBoughtEvent): void {
  let itemBought = ItemBought.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  if (!itemBought) {
    itemBought = new ItemBought(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }

  itemBought.buyer = event.params.buyer;
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  itemBought.price = event.params.price;

  activeItem!.buyer = event.params.buyer;

  itemBought.save();
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftContract)
  );

  if (!itemListed) {
    itemListed = new ItemListed(
      getIdFromEventParams(event.params.tokenId, event.params.nftContract)
    );
  }
  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftContract)
    );
  }

  itemListed.seller = event.params.seller;
  itemListed.nftAddress = event.params.nftContract;
  itemListed.tokenId = event.params.tokenId;
  itemListed.price = event.params.price;

  activeItem.seller = event.params.seller;
  activeItem.nftAddress = event.params.nftContract;
  activeItem.tokenId = event.params.tokenId;
  activeItem.price = event.params.price;
  activeItem.buyer = Address.fromString(
    '0x0000000000000000000000000000000000000000'
  );

  itemListed.save();
  activeItem.save();
}

export function handleItemCancelled(event: ItemCancelledEvent): void {
  let itemCancelled = ItemCancelled.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  if (!itemCancelled) {
    itemCancelled = new ItemCancelled(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }

  itemCancelled.seller = event.params.seller;
  itemCancelled.nftAddress = event.params.nftAddress;
  itemCancelled.tokenId = event.params.tokenId;

  activeItem!.buyer = Address.fromString(
    '0x000000000000000000000000000000000000dEaD'
  );

  itemCancelled.save();
  activeItem!.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}
