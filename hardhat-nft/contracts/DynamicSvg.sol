// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvg is ERC721 {
    uint256 private s_token_counter;
    string public s_lowImageURI;
    string public s_highImageURI;
    string public s_lowImageSvg;
    string public s_highImageSvg;
    mapping(uint256 => int256) s_tokenIdToHighValue;
    AggregatorV2V3Interface private immutable i_priceFeed;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";

    event NewNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicSvg", "SVG") {
        s_token_counter = 0;
        s_lowImageSvg = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV2V3Interface(priceFeedAddress);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function mintNFT(int256 highValue) public {
        _safeMint(msg.sender, s_token_counter);
        s_tokenIdToHighValue[s_token_counter] = highValue;
        emit NewNFT(s_token_counter, highValue);
        s_token_counter += 1;
    }

    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );

        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "URI Query for nonexistent token");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = s_lowImageURI;
        if (price > s_tokenIdToHighValue[tokenId]) {
            imageURI = s_highImageURI;
        }

        string memory encodedJson = Base64.encode(
            bytes(
                abi.encodePacked(
                    '{"name":"',
                    name(),
                    '","description":"NFT that changes depending on the price of Ethereum",',
                    '"attributes":[{"trait_type":"primitive","value":1}],',
                    '"image":"',
                    imageURI,
                    '"}'
                )
            )
        );

        return string(abi.encodePacked(_baseURI(), encodedJson));
    }
}
