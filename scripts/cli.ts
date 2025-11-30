import { ethers } from "hardhat";
import * as readline from "readline";

// Helper to ask questions in the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log("⚓ Maritime Blockchain CLI ⚓");
  console.log("---------------------------");

  // --- STEP 0: DEPLOYMENT ---
  // We deploy fresh contracts every time we run this CLI for testing purposes.
  // In a real scenario, you would connect to existing addresses.
  const [admin] = await ethers.getSigners();
  console.log(`[System] Deploying contracts with account: ${admin.address}...`);

  const VesselIdentity = await ethers.getContractFactory("VesselIdentity");
  const vesselContract = await VesselIdentity.deploy();
  await vesselContract.waitForDeployment();
  const vesselAddress = await vesselContract.getAddress();

  const SailorIdentity = await ethers.getContractFactory("SailorIdentity");
  const sailorContract = await SailorIdentity.deploy();
  await sailorContract.waitForDeployment();
  const sailorAddress = await sailorContract.getAddress();

  const NavigationHistory = await ethers.getContractFactory("NavigationHistory");
  const historyContract = await NavigationHistory.deploy(vesselAddress, sailorAddress);
  await historyContract.waitForDeployment();
  const historyAddress = await historyContract.getAddress();

  console.log(`[System] System Online.`);
  console.log(`         VesselIdentity:    ${vesselAddress}`);
  console.log(`         SailorIdentity:    ${sailorAddress}`);
  console.log(`         NavigationHistory: ${historyAddress}\n`);

  // --- INTERACTIVE LOOP ---
  let keepRunning = true;

  while (keepRunning) {
    console.log(`\nOptions:`);
    console.log(`  1. Register a Vessel`);
    console.log(`  2. Register a Sailor`);
    console.log(`  3. Log a Voyage`);
    console.log(`  4. Read Ledger (Audit)`);
    console.log(`  5. Exit`);

    const choice = await question("Select an option (1-5): ");

    try {
      switch (choice.trim()) {
        case "1": // REGISTER VESSEL
          console.log("\n--- Register Vessel ---");
          const vMeta = await question("Enter Vessel Metadata IPFS (e.g., 'ipfs://bafy...'): ");
          // Using admin address as owner for simplicity
          const vTx = await vesselContract.createVessel(admin.address, vMeta || "ipfs://default-vessel");
          const vReceipt = await vTx.wait();

          // Capture the event to get the ID [cite: 14]
          const vEvent = (await vesselContract.queryFilter(vesselContract.filters.VesselRegistered(), vReceipt?.blockNumber)).pop();
          if (vEvent) {
             console.log(`✅ Success! Vessel created.`);
             console.log(`   ID: ${vEvent.args[0]} | Owner: ${vEvent.args[1]}`);
          }
          break;

        case "2": // REGISTER SAILOR
          console.log("\n--- Register Sailor ---");
          // In a real app, the sailor would sign this. Here we mint to the admin for simplicity,
          // or you could generate a random wallet address to simulate another user.
          const sName = await question("Enter Sailor Name/Meta (e.g., 'ipfs://...'): ");
          const sTx = await sailorContract.createSailor(admin.address, sName || "ipfs://default-sailor");
          const sReceipt = await sTx.wait();

          // Capture event [cite: 52]
          const sEvent = (await sailorContract.queryFilter(sailorContract.filters.SailorRegistered(), sReceipt?.blockNumber)).pop();
          if (sEvent) {
             console.log(`✅ Success! Sailor registered.`);
             console.log(`   ID: ${sEvent.args[0]} | Wallet: ${sEvent.args[1]}`);
          }
          break;

        case "3": // LOG VOYAGE
          console.log("\n--- Log Voyage ---");
          const vesselIdInput = await question("Vessel ID: ");
          const sailorIdInput = await question("Sailor ID: ");
          const desc = await question("Voyage Description: ");
          const ipfsProof = await question("GPS/Log Proof IPFS Hash: ");

          // Timestamp defaults to now
          const timestamp = Math.floor(Date.now() / 1000);

          // Requires the caller (admin) to be the owner of the vessel
          const logTx = await historyContract.logVoyage(
            vesselIdInput,
            sailorIdInput,
            ipfsProof || "ipfs://proof",
            desc || "No description",
            timestamp
          );
          await logTx.wait();
          console.log(`✅ Voyage logged successfully at timestamp ${timestamp}.`);
          break;

        case "4": // READ LEDGER
          console.log("\n--- Read Ledger ---");
          const auditId = await question("Enter Vessel ID to audit: ");

          // Calls getVesselHistory
          const history = await historyContract.getVesselHistory(auditId);

          if (history.length === 0) {
            console.log("No voyages found for this vessel.");
          } else {
            console.log(`\nFound ${history.length} voyage(s):`);
            history.forEach((entry: any, index: number) => {
              const date = new Date(Number(entry.timestamp) * 1000).toLocaleString();
              console.log(`\n   [Voyage #${index + 1}]`);
              console.log(`   Date:        ${date}`);
              console.log(`   Sailor ID:   ${entry.sailorId}`);
              console.log(`   Description: ${entry.description}`);
              console.log(`   Proof Hash:  ${entry.ipfsHash}`);
            });
          }
          break;

        case "5":
          keepRunning = false;
          console.log("Goodbye!");
          break;

        default:
          console.log("Invalid option.");
          break;
      }
    } catch (error: any) {
      console.error(`\n❌ Error: ${error.reason || error.message}`);
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
