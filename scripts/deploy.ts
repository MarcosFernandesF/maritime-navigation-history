import { ethers } from "hardhat";

async function main() {
  console.log("Maritime Blockchain - Test");
  console.log("=====================================================");

  const [admin, vesselOwner, sailorUser] = await ethers.getSigners();

  // 1. DEPLOY
  console.log("\n[1] Deploying Contracts...");
  
  const VesselIdentity = await ethers.getContractFactory("VesselIdentity");
  const vesselContract = await VesselIdentity.deploy();
  await vesselContract.waitForDeployment();
  console.log(`- VesselIdentity Address:   ${await vesselContract.getAddress()}`);

  const SailorIdentity = await ethers.getContractFactory("SailorIdentity");
  const sailorContract = await SailorIdentity.deploy();
  await sailorContract.waitForDeployment();
  console.log(`- SailorIdentity Address:   ${await sailorContract.getAddress()}`);

  const NavigationHistory = await ethers.getContractFactory("NavigationHistory");
  const historyContract = await NavigationHistory.deploy(await vesselContract.getAddress(), await sailorContract.getAddress());
  await historyContract.waitForDeployment();
  console.log(`- NavigationHistory Address: ${await historyContract.getAddress()}`);

  // 2. REGISTER VESSEL
  console.log("\n[2] Registering Vessel...");
  
  // We simulate the metadata content
  const vesselName = "Veleiro TCC - Oceanis 38";
  const vesselMetadataURI = "ipfs://QmHashOfVesselMetadata_JSON";

  const vesselTx = await vesselContract.connect(vesselOwner).createVessel(
    vesselOwner.address, 
    vesselMetadataURI 
  );
  const vesselReceipt = await vesselTx.wait();

  // Capture Event
  const vesselEvents = await vesselContract.queryFilter(
    vesselContract.filters.VesselRegistered(), 
    vesselReceipt?.blockNumber, 
    vesselReceipt?.blockNumber
  );
  
  // Extracting detailed data from the Event
  const vesselArgs = vesselEvents[0].args;
  const vesselId = vesselArgs[0];
  const vesselOwnerArg = vesselArgs[1];
  const vesselUri = vesselArgs[2];

  console.log(`  > Vessel Name: "${vesselName}"`);
  console.log(`  > Token ID:    ${vesselId}`);
  console.log(`  > Owner Addr:  ${vesselOwnerArg}`);
  console.log(`  > Metadata:    ${vesselUri}`);

  // 3. REGISTER SAILOR
  console.log("\n[3] Registering Sailor...");
  
  const sailorName = "Marcos Fernandes";
  const sailorMetadataURI = "ipfs://QmHashOfSailorResume_JSON";

  const sailorTx = await sailorContract.connect(sailorUser).createSailor(
    sailorUser.address, 
    sailorMetadataURI 
  );
  const sailorReceipt = await sailorTx.wait();

  // Capture Event
  const sailorEvents = await sailorContract.queryFilter(
    sailorContract.filters.SailorRegistered(), 
    sailorReceipt?.blockNumber,
    sailorReceipt?.blockNumber
  );

  const sailorArgs = sailorEvents[0].args;
  const sailorId = sailorArgs[0];
  const sailorOwner = sailorArgs[1];
  const sailorUri = sailorArgs[2];

  console.log(`  > Sailor Name: "${sailorName}"`);
  console.log(`  > Token ID:    ${sailorId}`);
  console.log(`  > Wallet Addr: ${sailorOwner}`);
  console.log(`  > Resume URI:  ${sailorUri}`);

  // 4. LOG VOYAGE
  console.log("\n[4] Logging Voyage...");
  
  // Get current time in Seconds (Unix Timestamp)
  const tripDate = Math.floor(Date.now() / 1000); 

  const voyageTx = await historyContract.connect(vesselOwner).logVoyage(
    vesselId, 
    sailorId, 
    "ipfs://QmProofOfGPS_RealLog", 
    "Delivery trip: Floripa to Rio de Janeiro",
    tripDate
  );
  const voyageReceipt = await voyageTx.wait();

  const voyageEvents = await historyContract.queryFilter(
    historyContract.filters.VoyageLogged(),
    voyageReceipt?.blockNumber,
    voyageReceipt?.blockNumber
  );

  const logArgs = voyageEvents[0].args;

  console.log(`  > Vessel ID:   ${logArgs[0]}`);
  console.log(`  > Sailor ID:   ${logArgs[1]}`);
  console.log(`  > Timestamp:   ${logArgs[2]}`);
  console.log(`  > Proof Hash:  ${logArgs[3]}`);

  // 5. Security Check
  console.log("\n[5] Security Check: Simulating Unauthorized Access...");

  // The 'admin' user tries to log a voyage on 'vesselOwner's' boat
  // This MUST fail according to the White Paper rules.
  try {
    const hackerTx = await historyContract.connect(admin).logVoyage(
      vesselId,
      sailorId, 
      "ipfs://HackedData", 
      "Fake Trip",
      Math.floor(Date.now() / 1000)
    );
    await hackerTx.wait();
    console.log("CRITICAL ERROR: The hacker was able to log a trip! Security failed.");
  } catch (error: any) {
    if (error.message.includes("Error: You are not the owner")) {
        console.log("SECURITY PASSED: Unauthorized attempt blocked by Smart Contract.");
        console.log("   Reason: 'Error: You are not the owner of this vessel.'");
    } else {
        console.log("Transaction failed, but with unexpected error:", error.message);
    }
  }

  // 6. FINAL AUDIT
  console.log("\n[6] Auditing Vessel History (Reading Ledger)...");
  
  const history = await historyContract.getVesselHistory(vesselId);
  
  if (history.length > 0) {
    const entry = history[0];
    const date = new Date(Number(entry.timestamp) * 1000).toLocaleString();

    console.log("\n  --- OFFICIAL BLOCKCHAIN RECORD ---");
    console.log(`  [DATE]        ${date}`);
    console.log(`  [VESSEL]      ID ${vesselId}`);
    console.log(`  [CAPTAIN]     ID ${entry.sailorId}`);
    console.log(`  [ROUTE]       "${entry.description}"`);
    console.log(`  [EVIDENCE]    ${entry.ipfsHash}`);
    console.log("  ----------------------------------");
  } else {
    console.log("  No history found.");
  }

  console.log("\nSystem Verified Successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});