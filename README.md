Here is the **README.md** translated into English, adapted for your project context.

-----

# Maritime Navigation History ⚓

This repository contains the MVP (Minimum Viable Product) developed for the course **INE5458 - Blockchain Technologies and Cryptocurrencies**.

The **Maritime Navigation History** project aims to leverage blockchain technology to ensure the immutability, transparency, and traceability of maritime navigation records (such as logbooks, routes, incidents, or maintenance logs), preventing tampering with sensitive data.

## 🛠 Technologies Used

  * **Contract Language:** [Solidity](https://soliditylang.org/) (v0.8.28)
  * **Development Framework:** [Hardhat](https://hardhat.org/)
  * **Scripting/Testing Language:** [TypeScript](https://www.typescriptlang.org/)
  * **Libraries:**
      * [OpenZeppelin Contracts](https://www.openzeppelin.com/contracts): For security patterns and modular contracts.
      * [Ethers.js](https://docs.ethers.org/): For blockchain interaction.
      * [Dotenv](https://www.npmjs.com/package/dotenv): For environment variable management.

## 📋 Prerequisites

Ensure you have the following installed on your machine:

  * [Node.js](https://nodejs.org/) (LTS version recommended, \>= 18)
  * [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🚀 Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone <YOUR_REPO_URL>
    cd maritime-navigation-history
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration (.env):**
    The project uses the `dotenv` library. Create a `.env` file in the project root to store private keys and RPC URLs (if deploying to testnets like Sepolia or Amoy).

    Example `.env`:

    ```env
    REPORT_GAS=true
    # SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/..."
    # PRIVATE_KEY="your_private_key_here"
    ```

## 💻 Key Commands

This project uses Hardhat for compilation, testing, and deployment. Below are the essential commands:

### Compile Contracts

Compiles the `.sol` files located in the `contracts/` folder.

```bash
npx hardhat compile
```

### Run Tests

Executes the automated tests defined in the `test/` folder.

```bash
npx hardhat test
```

*To view the gas usage report (if configured):*

```bash
REPORT_GAS=true npx hardhat test
```

### Start Local Node

Starts a local Hardhat blockchain network for manual testing and local deployment.

```bash
npx hardhat node
```

### Deploy (Ignition)

To deploy the contracts using the Hardhat Ignition module:

```bash
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```

*(Note: Replace `Lock.ts` with the name of your navigation contract module when created).*

## 📂 Project Structure

  * `contracts/`: Solidity source code for Smart Contracts.
  * `ignition/modules/`: Hardhat Ignition deployment modules.
  * `test/`: Unit and integration test scripts.
  * `hardhat.config.ts`: Hardhat configuration file (Networks, compiler version, etc.).

