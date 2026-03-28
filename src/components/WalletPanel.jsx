const walletText = {
  idle: "Connect your wallet to vote on Soroban.",
  connecting: "Waiting for wallet approval...",
  connected: "Wallet connected and ready for transactions.",
};

export default function WalletPanel({ wallet, onConnect, onDisconnect }) {
  return (
    <section className="glass-panel w-full rounded-3xl p-5 lg:max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Wallet
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {walletText[wallet.status] ?? walletText.idle}
          </p>
        </div>

        {wallet.publicKey ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={wallet.status === "connecting"}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {wallet.status === "connecting" ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      <div className="mt-5 space-y-2 rounded-2xl border border-white/8 bg-slate-900/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Provider
          </span>
          <span className="text-sm text-slate-200">
            {wallet.name || "Not connected"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Public Key
          </span>
          <code className="max-w-[220px] break-all text-right text-xs text-cyan-200">
            {wallet.publicKey || "Connect a Stellar wallet"}
          </code>
        </div>
      </div>
    </section>
  );
}
