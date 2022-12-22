// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

error NftMarketplace__InsufficientPrice(string expected, uint256 retreived);
error NftMarketplace__NotApprovedForMarketPlace();
error NftMarketplace__AlreadyListed();
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed();
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

/**
 * @title An NFT marketplace
 * @author Uladzimir Kireyeu
 * @notice This project is created using Patric Collin's tutorial
 * @dev Evade expensive state-changing operations as much as possible
 */
contract NftMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    modifier PriceIsBelowZero(uint256 price) {
        if (price <= 0) {
            revert NftMarketplace__InsufficientPrice({
                expected: 'Price must be higher than zero!',
                retreived: price
            });
        }
        _;
    }

    modifier AlreadyListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];

        if (listing.price != 0 || listing.seller != address(0)) {
            revert NftMarketplace__AlreadyListed();
        }
        _;
    }

    modifier isOwner(address nftAddress, uint256 tokenId) {
        IERC721 nft = IERC721(nftAddress);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }
    modifier isListed(address nftAddress, uint256 tokeinId) {
        Listing memory listing = s_listings[nftAddress][tokeinId];

        if (listing.price == 0) {
            revert NftMarketplace__NotListed();
        }
        _;
    }

    constructor() {}

    /**
     * @notice Lists NFT token on the marketplace
     * @dev You can change PriceIsBelowZero modifier to allow users sell their
     * tokens for free
     * @param nftAddress Address of the erc721-compatible contract
     * @param tokenId tokenId of the nft
     * @param price Price of the nft in wei
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        PriceIsBelowZero(price)
        AlreadyListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId)
    {
        IERC721 nft = IERC721(nftAddress);

        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketPlace();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }

        s_proceeds[listedItem.seller] =
            s_proceeds[listedItem.seller] +
            msg.value;
        delete (s_listings[nftAddress][tokenId]);

        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );

        emit ItemBought(msg.sender, nftAddress, tokenId, msg.value);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId) {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }

        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}('');

        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId)
        isListed(nftAddress, tokenId)
    {
        delete s_listings[nftAddress][tokenId];
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
