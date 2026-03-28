# Live Poll dApp

Live Poll dApp is a React + Vite frontend with a Soroban smart contract on Stellar. Users connect a supported Stellar wallet, vote `YES` or `NO` on-chain, and see the poll totals update from contract state.

## Features

- Multi-wallet connection with [StellarWalletsKit](https://creit.tech/docs/Stellar-Wallets-Kit/)
- Freighter support included by default
- Connect and disconnect wallet flow
- Public key display in the UI
- Soroban contract integration for `vote_yes`, `vote_no`, and `get_results`
- Transaction status tracking for pending, success, and failure states
- Error handling for wallet not found, rejected transactions, and insufficient balance
- Dark-theme web3 UI with Tailwind CSS
- Poll result refresh loop for near real-time updates

## Tech Stack

- React
- Vite
- Tailwind CSS
- StellarWalletsKit (`@creit.tech/stellar-wallets-kit`)
- Stellar JavaScript SDK (`@stellar/stellar-sdk`)
- Rust
- Soroban SDK
- Stellar Testnet

## Project Structure

```text
LivePoll-dApp/
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── contracts/
│   └── live-poll/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── components/
    │   ├── ErrorBanner.jsx
    │   ├── PollCard.jsx
    │   ├── ResultsCard.jsx
    │   ├── Spinner.jsx
    │   ├── StatusCard.jsx
    │   └── WalletPanel.jsx
    ├── hooks/
    │   └── useLivePoll.js
    ├── lib/
    │   ├── constants.js
    │   ├── stellar.js
    │   └── wallet.js
    └── pages/
        └── HomePage.jsx
```

## Frontend Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and replace the placeholder values:

```env
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_SOROBAN_CONTRACT_ID=YOUR_CONTRACT_ID_HERE
VITE_READONLY_ACCOUNT_PUBLIC_KEY=OPTIONAL_FUNDED_TESTNET_ACCOUNT
VITE_RESULTS_POLL_INTERVAL=8000
```

### 3. Start the app

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Soroban Smart Contract

The contract lives at:

- `contracts/live-poll/src/lib.rs`

It stores two counters:

- `YES`
- `NO`

Available functions:

- `vote_yes()`
- `vote_no()`
- `get_results()`

## Build and Deploy with `stellar-cli`

### 1. Move into the contract folder

```bash
cd contracts/live-poll
```

This puts you in the Soroban contract project so the next build command runs against the correct `Cargo.toml`.

### 2. Build the contract

```bash
stellar contract build
```

This compiles the Rust contract into a `.wasm` file that Soroban can deploy.

### 3. Create and fund a testnet identity

```bash
stellar keys generate alice --network testnet --fund
```

This creates a local key named `alice` and funds it with testnet XLM using Friendbot, so it can pay deployment fees.

### 4. Deploy the contract to Stellar testnet

```bash
stellar contract deploy --wasm target/wasm32v1-none/release/live_poll.wasm --source-account alice --network testnet --alias live_poll
```

This uploads the compiled contract and deploys it on testnet. The command returns the contract ID, which starts with `C`.

### 5. Show the saved contract ID again later

```bash
stellar contract alias show live_poll
```

This prints the contract ID stored locally for the `live_poll` alias.

## Example Contract Address

```text
Contract ID: YOUR_CONTRACT_ID_HERE
```

## Example Transaction Hash

```text
3f7a7c5ef9c1fdbf5c41f29b24f8aab1baf5f06a9d4e6c3f4d46f7b0b74f1abc
```

## Wallet Flow

- Click `Connect Wallet`
- Choose Freighter or another supported wallet from the modal
- Approve connection
- Submit a vote
- Approve the transaction in the wallet
- Watch the pending, success, or error state in the UI

## Error Handling Included

The React app includes user-facing handling for:

- Wallet not installed
- User rejected connection
- Transaction rejected
- Insufficient balance
- Missing contract ID configuration

## Screenshots

Add your screenshots here after running the app:

```md
![Home Screen](./screenshots/home.png)
![Vote Success](./screenshots/vote-success.png)
![Wallet Connected](./screenshots/wallet-connected.png)
```

## Notes

- Use a funded Stellar testnet wallet for voting transactions
- Freighter is the minimum supported wallet, but the app also includes xBull and Albedo modules
- For read-only polling without a connected wallet, set `VITE_READONLY_ACCOUNT_PUBLIC_KEY` to any funded testnet account

## Sources

- Stellar Wallets Kit docs: [Creit Technologies](https://creit.tech/docs/Stellar-Wallets-Kit/)
- Soroban deployment guide: [Stellar Docs](https://developers.stellar.org/docs/build/smart-contracts/getting-started/deploy-to-testnet)
- Contract deploy command reference: [Stellar Docs](https://developers.stellar.org/docs/build/guides/cli/deploy-contract)
