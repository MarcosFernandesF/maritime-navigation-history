// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VesselIdentity
 * @dev This contract represents the "Digital Passport" of a vessel.
 * It issues unique NFTs for each boat registered in the system.
 */
contract VesselIdentity is ERC721, ERC721URIStorage, Ownable {
    
    uint256 private _nextTokenId;

    // Event to notify off-chain app, like our CLI.
    event VesselRegistered(uint256 indexed tokenId, address indexed owner, string tokenURI);

    constructor() ERC721("MaritimeVesselPassport", "MVP") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mints a new NFT representing a vessel.
     * @param to The address of the vessel owner (wallet).
     * @param uri The metadata link (IPFS hash containing Name, Hull ID, Model).
     * @return The ID of the newly created vessel token.
     */
    function createVessel(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++; // Get current ID and increment for the next one
        
        // Mints the NFT to the owner's address
        _safeMint(to, tokenId); 

        // Links the metadata (Name, Hull ID) to the token
        _setTokenURI(tokenId, uri); 

        // Emits the log for the external world
        emit VesselRegistered(tokenId, to, uri); 
        
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