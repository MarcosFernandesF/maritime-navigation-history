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
     * @param voyageTimestamp When the trip actually happened (User input).
     */
    function logVoyage(
        uint256 vesselId, 
        uint256 sailorId, 
        string memory ipfsHash, 
        string memory description,
        uint256 voyageTimestamp 
    ) public {
        
        // Only the owner can log a voyage
        require(vesselContract.ownerOf(vesselId) == msg.sender, "Error: You are not the owner of this vessel.");

        // Prevent registering empty data
        require(bytes(ipfsHash).length > 0, "Error: IPFS Hash is required.");
        require(bytes(description).length > 0, "Error: Description is required.");

        // You cannot log a trip that happens in the future
        require(voyageTimestamp <= block.timestamp, "Error: Voyage date cannot be in the future.");

        // Ensure the sailor token has been minted and exists (owner is not 0x0 address)
        try sailorContract.ownerOf(sailorId) returns (address sailorOwner) {
            require(sailorOwner != address(0), "Error: Invalid Sailor ID.");
        } catch {
            revert("Error: Sailor ID does not exist.");
        }

        VoyageEntry memory newVoyage = VoyageEntry({
            timestamp: voyageTimestamp,
            sailorId: sailorId,
            ipfsHash: ipfsHash,
            description: description
        });

        vesselVoyages[vesselId].push(newVoyage);

        emit VoyageLogged(vesselId, sailorId, voyageTimestamp, ipfsHash);
    }

    /**
     * @dev Reads the entire history of a vessel.
     * Useful for the "Audit" CLI command.
     */
    function getVesselHistory(uint256 vesselId) public view returns (VoyageEntry[] memory) {
        return vesselVoyages[vesselId];
    }
}