export const RPC_URL =
  import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";

export const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID || "";

export const READONLY_ACCOUNT_PUBLIC_KEY =
  import.meta.env.VITE_READONLY_ACCOUNT_PUBLIC_KEY || "";

export const POLL_INTERVAL_MS = Number(import.meta.env.VITE_RESULTS_POLL_INTERVAL || 8000);

export const CONTRACT_METHODS = {
  voteYes: "vote_yes",
  voteNo: "vote_no",
  getResults: "get_results",
};
