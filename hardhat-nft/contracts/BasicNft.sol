// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://QmdJDf1ZbzkkE6ouTc4ZaXbju2kRfj2ZXQoco284W9ytnD";
    uint256 internal s_count = 0;

    constructor() ERC721("Basic", "BSC") {}

    function minNft() public {
        s_count++;
        _mint(msg.sender, s_count);
    }

    function tokenURI() public pure returns (string memory) {
        return TOKEN_URI;
    }

    function getCount() public view returns (uint256) {
        return s_count;
    }
}
