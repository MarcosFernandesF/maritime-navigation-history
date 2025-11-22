// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title NavigationHistory
 * @dev This is the central ledger of the Maritime Blockchain.
 * It stores immutable logs of voyages and maintenance, linking Vessels to Sailors.
 */
contract NavigationHistory {

    // We store the address of the Vessel Contract to verify ownership later
    IERC721 public vesselContract;
    
    // We store the address of the Sailor Contract to verify if a sailor exists
    IERC721 public sailorContract;

    // Defines what a "Voyage" looks like in our database
    struct VoyageEntry {
        uint256 timestamp;
        uint256 sailorId;
        string ipfsHash;
        string description;
    }

    // The main database: A mapping connecting a Vessel ID to a list of Voyages
    mapping(uint256 => VoyageEntry[]) private vesselVoyages;

    // Notifies the CLI that a trip happened
    event VoyageLogged(
        uint256 indexed vesselId, 
        uint256 indexed sailorId, 
        uint256 timestamp, 
        string ipfsHash
    );

    /**
     * @param _vesselContractAddress The address where VesselIdentity is deployed
     * @param _sailorContractAddress The address where SailorIdentity is deployed
     */
    constructor(address _vesselContractAddress, address _sailorContractAddress) {
        vesselContract = IERC721(_vesselContractAddress);
        sailorContract = IERC721(_sailorContractAddress);
    }

    /**
     * @dev Adds a new voyage entry to a vessel's history.
     * @param vesselId The ID of the boat.
     * @param sailorId The ID of the sailor responsible.
     * @param ipfsHash The CID from IPFS containing the proofs.
     * @param description A short summary of the trip.
     */
    function logVoyage(
        uint256 vesselId, 
        uint256 sailorId, 
        string memory ipfsHash, 
        string memory description
    ) public {
        
        // Only the owner of the vessel can log a trip for it.
        require(vesselContract.ownerOf(vesselId) == msg.sender, "Error: You are not the owner of this vessel.");

        // Ensure the sailor actually exists
        require(sailorContract.ownerOf(sailorId) != address(0), "Error: Invalid Sailor ID.");

        VoyageEntry memory newVoyage = VoyageEntry({
            timestamp: block.timestamp,
            sailorId: sailorId,
            ipfsHash: ipfsHash,
            description: description
        });

        vesselVoyages[vesselId].push(newVoyage);

        emit VoyageLogged(vesselId, sailorId, block.timestamp, ipfsHash);
    }

    /**
     * @dev Reads the entire history of a vessel.
     * Useful for the "Audit" CLI command.
     */
    function getVesselHistory(uint256 vesselId) public view returns (VoyageEntry[] memory) {
        return vesselVoyages[vesselId];
    }
}