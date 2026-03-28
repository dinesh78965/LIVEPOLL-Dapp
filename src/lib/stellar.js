import {
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc as StellarRpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, CONTRACT_METHODS, NETWORK_PASSPHRASE, RPC_URL } from "./constants";
import { getWalletKit } from "./wallet";

const rpcServer = new StellarRpc.Server(RPC_URL);

function ensureContractId() {
  if (!CONTRACT_ID) {
    throw new Error("Set VITE_SOROBAN_CONTRACT_ID in your .env file.");
  }
}

async function buildContractTransaction({ publicKey, methodName, args = [] }) {
  ensureContractId();

  const sourceAccount = await rpcServer.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE || Networks.TESTNET,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
    .build();

  const simulation = await rpcServer.simulateTransaction(transaction);

  if (StellarRpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  return StellarRpc.assembleTransaction(transaction, simulation).build();
}

export async function invokePollContract({ methodName, publicKey }) {
  const kit = getWalletKit();
  const userArg = nativeToScVal(publicKey, { type: "address" });
  const preparedTransaction = await buildContractTransaction({
    publicKey,
    methodName,
    args: [userArg],
  });
  const { signedTxXdr } = await kit.signTransaction(preparedTransaction.toXDR(), {
    address: publicKey,
    networkPassphrase: NETWORK_PASSPHRASE || Networks.TESTNET,
  });

  const signedTransaction = TransactionBuilder.fromXDR(
    signedTxXdr,
    NETWORK_PASSPHRASE || Networks.TESTNET,
  );

  const sendResponse = await rpcServer.sendTransaction(signedTransaction);

  if (sendResponse.status !== "PENDING") {
    throw new Error(sendResponse.errorResultXdr || "Transaction was not accepted by Stellar RPC.");
  }

  const finalResponse = await rpcServer.pollTransaction(sendResponse.hash, {
    attempts: 20,
    sleepStrategy: () => 1500,
  });

  if (finalResponse.status !== StellarRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(
      finalResponse.resultXdr || finalResponse.status || "Transaction failed before confirmation.",
    );
  }

  return {
    hash: sendResponse.hash,
    result: finalResponse.returnValue ? scValToNative(finalResponse.returnValue) : null,
  };
}

export async function getContractResults(publicKey) {
  const preparedTransaction = await buildContractTransaction({
    publicKey,
    methodName: CONTRACT_METHODS.getResults,
  });

  const simulation = await rpcServer.simulateTransaction(preparedTransaction);

  if (StellarRpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  const nativeResult = scValToNative(simulation.result.retval);

  return {
    yes: Number(nativeResult.yes ?? nativeResult.YES ?? 0),
    no: Number(nativeResult.no ?? nativeResult.NO ?? 0),
  };
}

export function normalizeDappError(error) {
  const message = String(error?.message || error || "Unknown error");
  const lower = message.toLowerCase();

  if (lower.includes("already voted")) {
    return "You have already voted. Only one vote allowed.";
  }

  if (lower.includes("install") || lower.includes("not available") || lower.includes("wallet not")) {
    return "Wallet not found. Install Freighter or another supported Stellar wallet and try again.";
  }

  if (
    lower.includes("rejected") ||
    lower.includes("user declined") ||
    lower.includes("denied") ||
    lower.includes("cancelled")
  ) {
    return "Connection or transaction was rejected in the wallet.";
  }

  if (
    lower.includes("underfunded") ||
    lower.includes("insufficient balance") ||
    lower.includes("op_underfunded")
  ) {
    return "Insufficient balance. Fund your Stellar account with testnet XLM and retry.";
  }

  if (lower.includes("set vite_soroban_contract_id")) {
    return message;
  }

  return `Stellar dApp error: ${message}`;
}
