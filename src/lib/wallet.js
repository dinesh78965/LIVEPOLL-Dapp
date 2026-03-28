import freighterApi from "@stellar/freighter-api";

const { isConnected, requestAccess, getAddress, signTransaction } = freighterApi;

export function initializeWalletKit() {
  return true;
}

export async function connectWithWalletKit() {
  const connection = await isConnected();

  if (connection?.error) {
    throw new Error(connection.error.message || connection.error || "Freighter is not available.");
  }

  if (!connection?.isConnected) {
    throw new Error("Wallet not found. Install Freighter and refresh the page.");
  }

  const access = await requestAccess();
  if (access?.error) {
    throw new Error(access.error.message || access.error || "User rejected connection");
  }

  const addressResponse = await getAddress();
  if (addressResponse?.error) {
    throw new Error(addressResponse.error.message || addressResponse.error || "Unable to fetch address");
  }

  if (!addressResponse?.address) {
    throw new Error("No public key returned by Freighter.");
  }

  return {
    publicKey: addressResponse.address,
    walletName: "Freighter",
  };
}

export async function disconnectWalletKit() {
  return true;
}

export function getWalletKit() {
  return {
    async signTransaction(xdr, options) {
      const result = await signTransaction(xdr, {
        address: options?.address,
        networkPassphrase: options?.networkPassphrase,
      });

      if (result?.error) {
        throw new Error(result.error.message || result.error || "Transaction rejected");
      }

      return result;
    },
  };
}
