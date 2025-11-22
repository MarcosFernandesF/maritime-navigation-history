// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SailorIdentity
 * @dev This contract represents the "Nautical Resume" of a sailor.
 * Unlike the vessel, this NFT represents a person's professional identity.
 * It serves as the anchor for future certifications and voyage logs.
 */
contract SailorIdentity is ERC721, ERC721URIStorage, Ownable {
    
    uint256 private _nextTokenId;

    // Event to notify off-chain apps, like our CLI.
    event SailorRegistered(uint256 indexed tokenId, address indexed wallet, string tokenURI);

    constructor() ERC721("MaritimeSailorResume", "MSR") Ownable(msg.sender) {
        // The counter starts in 100 just to visually distinguish from Vessel Ids (1, 2...).
        _nextTokenId = 100;
    }

    /**
     * @dev Mints a new NFT representing a sailor's resume.
     * @param to The address of the sailor's wallet.
     * @param uri The metadata link (IPFS hash containing Name, Nationality, License Level).
     * @return The ID of the newly created sailor token.
     */
    function createSailor(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
         // Mints the NFT to the sailor's address
        _safeMint(to, tokenId);

        // Links the personal data to the token
        _setTokenURI(tokenId, uri);

        // Emits log
        emit SailorRegistered(tokenId, to, uri);
        
        return tokenId;
    }

    // The following functions are overrides required by Solidity for ERC721URIStorage

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}