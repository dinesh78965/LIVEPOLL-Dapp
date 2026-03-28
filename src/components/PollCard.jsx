import Spinner from "./Spinner";

export default function PollCard({ wallet, tx, voteState, onVoteYes, onVoteNo }) {
  const isPending = tx.status === "pending";
  const isConnected = Boolean(wallet.publicKey);
  const isVoteLocked = voteState.hasVoted || isPending;

  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_36%)]" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200">
          Live vote
        </p>
        <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
          Do you support Web3?
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
          Vote on-chain through a Soroban smart contract. Each click builds,
          signs, submits, and tracks a Stellar transaction from the UI.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onVoteYes}
            disabled={!isConnected || isVoteLocked}
            className="rounded-3xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-5 text-left transition hover:border-emerald-300/50 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="block text-xs uppercase tracking-[0.28em] text-emerald-200">
              Vote
            </span>
            <span className="mt-3 block text-2xl font-semibold text-white">
              YES
            </span>
            <span className="mt-2 block text-sm text-slate-300">
              Signal support for Web3.
            </span>
          </button>

          <button
            type="button"
            onClick={onVoteNo}
            disabled={!isConnected || isVoteLocked}
            className="rounded-3xl border border-rose-400/25 bg-rose-500/10 px-6 py-5 text-left transition hover:border-rose-300/50 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="block text-xs uppercase tracking-[0.28em] text-rose-200">
              Vote
            </span>
            <span className="mt-3 block text-2xl font-semibold text-white">
              NO
            </span>
            <span className="mt-2 block text-sm text-slate-300">
              Register your opposition on-chain.
            </span>
          </button>
        </div>

        <div className="mt-6 flex min-h-10 items-center gap-3 text-sm text-slate-300">
          {isPending ? (
            <>
              <Spinner />
              <span>Transaction pending in Stellar RPC...</span>
            </>
          ) : voteState.message ? (
            <span>{voteState.message}</span>
          ) : tx.status === "success" ? (
            <span>Vote submitted successfully. Buttons are now locked for this wallet.</span>
          ) : tx.status === "error" ? (
            <span>{tx.error}</span>
          ) : (
            <span>
              {isConnected
                ? "Wallet connected. Choose YES or NO to submit your vote."
                : "Connect a funded Stellar testnet wallet to start voting."}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
