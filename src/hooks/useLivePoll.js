import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connectWithWalletKit, disconnectWalletKit, initializeWalletKit } from "../lib/wallet";
import {
  CONTRACT_METHODS,
  POLL_INTERVAL_MS,
  READONLY_ACCOUNT_PUBLIC_KEY,
} from "../lib/constants";
import {
  getContractResults,
  invokePollContract,
  normalizeDappError,
} from "../lib/stellar";

const initialWallet = {
  status: "idle",
  publicKey: "",
  name: "",
  error: "",
};

const initialPoll = {
  yes: 0,
  no: 0,
  loading: false,
  lastUpdated: "",
};

const initialTx = {
  status: "idle",
  hash: "",
  error: "",
};

const initialVoteState = {
  hasVoted: false,
  message: "",
};

export function useLivePoll() {
  const [wallet, setWallet] = useState(initialWallet);
  const [poll, setPoll] = useState(initialPoll);
  const [tx, setTx] = useState(initialTx);
  const [voteState, setVoteState] = useState(initialVoteState);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeWalletKit();
  }, []);

  const clearError = useCallback(() => {
    setWallet((current) => ({ ...current, error: "" }));
    setTx((current) => ({ ...current, error: "" }));
    setVoteState((current) => ({ ...current, message: "" }));
  }, []);

  const refreshResults = useCallback(
    async (publicKeyOverride) => {
      const sourceAccount =
        publicKeyOverride || wallet.publicKey || READONLY_ACCOUNT_PUBLIC_KEY;

      if (!sourceAccount) {
        return;
      }

      setPoll((current) => ({ ...current, loading: true }));

      try {
        const results = await getContractResults(sourceAccount);
        setPoll({
          yes: results.yes,
          no: results.no,
          loading: false,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        const friendly = normalizeDappError(error);
        setWallet((current) => ({ ...current, error: friendly }));
        setPoll((current) => ({ ...current, loading: false }));
      }
    },
    [wallet.publicKey],
  );

  const connectWallet = useCallback(async () => {
    setWallet((current) => ({
      ...current,
      status: "connecting",
      error: "",
    }));

    try {
      const connection = await connectWithWalletKit();

      setWallet({
        status: "connected",
        publicKey: connection.publicKey,
        name: connection.walletName,
        error: "",
      });
      setVoteState(initialVoteState);

      await refreshResults(connection.publicKey);
    } catch (error) {
      setWallet({
        ...initialWallet,
        error: normalizeDappError(error),
      });
    }
  }, [refreshResults]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnectWalletKit();
    } finally {
      setWallet(initialWallet);
      setTx(initialTx);
      setVoteState(initialVoteState);
    }
  }, []);

  const submitVote = useCallback(
    async (methodName) => {
      if (!wallet.publicKey) {
        setWallet((current) => ({
          ...current,
          error: "Connect a Stellar wallet before submitting a vote.",
        }));
        return;
      }

      if (tx.status === "pending" || voteState.hasVoted) {
        return;
      }

      setTx({
        status: "pending",
        hash: "",
        error: "",
      });
      setVoteState((current) => ({ ...current, message: "" }));

      try {
        const result = await invokePollContract({
          methodName,
          publicKey: wallet.publicKey,
        });

        setTx({
          status: "success",
          hash: result.hash,
          error: "",
        });
        setVoteState({
          hasVoted: true,
          message: "Vote already submitted",
        });

        await refreshResults(wallet.publicKey);
      } catch (error) {
        const friendly = normalizeDappError(error);
        setTx({
          status: "error",
          hash: "",
          error: friendly,
        });

        if (friendly === "You have already voted. Only one vote allowed.") {
          setVoteState({
            hasVoted: true,
            message: "Vote already submitted",
          });
        }
      }
    },
    [refreshResults, tx.status, voteState.hasVoted, wallet.publicKey],
  );

  const voteYes = useCallback(() => submitVote(CONTRACT_METHODS.voteYes), [submitVote]);
  const voteNo = useCallback(() => submitVote(CONTRACT_METHODS.voteNo), [submitVote]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const sourceAccount = wallet.publicKey || READONLY_ACCOUNT_PUBLIC_KEY;
    if (!sourceAccount) {
      return undefined;
    }

    refreshResults(sourceAccount);

    intervalRef.current = setInterval(() => {
      refreshResults(sourceAccount);
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshResults, wallet.publicKey]);

  return useMemo(
    () => ({
      wallet,
      poll,
      tx,
      voteState,
      connectWallet,
      disconnectWallet,
      voteYes,
      voteNo,
      refreshResults,
      clearError,
    }),
    [
      clearError,
      connectWallet,
      disconnectWallet,
      poll,
      refreshResults,
      tx,
      voteState,
      voteNo,
      voteYes,
      wallet,
    ],
  );
}
